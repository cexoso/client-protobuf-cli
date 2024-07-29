import { parse, Service, Root, IParserResult, INamespace, Method, Type } from 'protobufjs'
import { join } from 'path'
import { readFile } from 'fs'
const buildInProtobufPath = join(__dirname, '../buildin-protobufs')

type onFetchFunction = (
  path: string,
  callback: (error: Error | null, content?: string) => void
) => void

function findServices(parserResult: IParserResult) {
  const nested = parserResult.root.nested
  const packageName = parserResult.package
  if (!nested || !packageName) {
    throw new Error("can't not find service")
  }

  const packageContent = nested[packageName]

  const keys = Object.keys(packageContent)

  // 仅在包里找一层

  const services = keys
    .map((key) => packageContent[key])
    .filter((value) => value instanceof Service)
  if (services.length > 1) {
    throw new Error('目前我们仅支持一个 proto 文件声明一个 service')
  }
  return services[0]
}

interface ProtoServiceSnapshot {
  protobufRoot: INamespace
  service: string
}

class PBLoader {
  #data: { service: Service; root: Root } | null = null
  #onFetch: onFetchFunction | null = null
  public setOnFetch(onFetch: onFetchFunction) {
    this.#onFetch = onFetch
  }
  async #resolveImports(parserResult: IParserResult) {
    if (this.#onFetch) {
      parserResult.root.fetch = this.#onFetch as Root['fetch']
    }
    if (!parserResult.imports) {
      return Promise.resolve([])
    }
    return Promise.all(parserResult.imports.map((importFile) => parserResult.root.load(importFile)))
  }
  // 这里可以考虑存内存里面，减少 IO
  #loadbuildInProtobufs(path: string) {
    return new Promise<string>((resolve, reject) => {
      readFile(join(buildInProtobufPath, path), (error, content) => {
        if (error) {
          reject(error)
        } else {
          resolve(content.toString())
        }
      })
    })
  }
  public async loadContents(mainKey: string, contentMaps: Map<string, string>): Promise<void> {
    const main = contentMaps.get(mainKey)!
    this.#onFetch = (path, callback) => {
      const content = contentMaps.get(path)
      if (content) {
        callback(null, content)
      } else {
        this.#loadbuildInProtobufs(path).then(
          (content) => callback(null, content),
          () => callback(new Error(`can't find ${path}`))
        )
      }
    }
    const result = parse(main)
    await this.#resolveImports(result)
    result.root.resolveAll()
    const service = findServices(result)
    this.#data = { service, root: result.root }
  }
  public async loadByPath(path: string) {
    const content = await new Promise<string>((resolve, reject) => {
      readFile(path, (err, content) => {
        if (err) {
          reject(err)
        } else {
          resolve(content.toString())
        }
      })
    })
    await this.loadProtobufContent(content)
  }
  public async loadProtobufContent(protobufContent: string) {
    const result = parse(protobufContent)
    await this.#resolveImports(result)
    result.root.resolveAll()
    const service = findServices(result)
    this.#data = { service, root: result.root }
  }
  public getRoot() {
    return this.#data.root
  }
  public toJSON(): ProtoServiceSnapshot | null {
    if (!this.#data) {
      return null
    }
    const { service, root } = this.#data
    return {
      protobufRoot: root.toJSON(),
      service: service.fullName,
    }
  }
  get serviceShortName() {
    if (!this.#data) {
      return null
    }
    const { service } = this.#data
    return service.name
  }
  public getServiceId(serviceName: string): number {
    const root = this.getRoot()
    const service = root.lookupService(serviceName)
    return service.options['(srpc.service_option_id)']
  }
  get methods() {
    if (!this.#data) {
      return []
    }
    const { service } = this.#data
    return Object.keys(service.methods).map((key) => service.methods[key])
  }
  public fromJSON(json: ProtoServiceSnapshot) {
    const root = Root.fromJSON(json.protobufRoot)
    const service = root.lookupService(json.service)
    this.#data = {
      root,
      service,
    }
  }
}

export interface MethodViewModel {
  methodId: number
  originMethod: Method
  requestType: Type
  responseType: Type
}
export interface ServiceViewModel {
  serviceId: number
  serviceName: string
  methods: MethodViewModel[]
}

export const loadPBfromLocalPath = async (opts: { absolutePath: string }) => {
  const loader = new PBLoader()
  await loader.loadByPath(opts.absolutePath)
  const servicesServiceShortName = [loader.serviceShortName]

  function getRequestType(method: Method) {
    return loader.getRoot().lookupType(method.requestType)
  }
  function getResponseType(method: Method) {
    return loader.getRoot().lookupType(method.responseType)
  }
  function getMethodId(method: Method): number {
    return method.options['(srpc.method_option_id)']
  }

  return {
    services: servicesServiceShortName,
    // TODO: 预留多 service 的接口，目前暂时先支持单 service
    getMethodsByServiceName(_serviceName: string) {
      return loader.methods
    },
    getRequestType,
    getResponseType,
    getServicesViewModel(): ServiceViewModel[] {
      return servicesServiceShortName.map((serviceName) => ({
        serviceName: serviceName,
        serviceId: loader.getServiceId(serviceName),
        methods: loader.methods.map((method) => ({
          methodId: getMethodId(method),
          requestType: getRequestType(method),
          responseType: getResponseType(method),
          originMethod: method,
        })),
      }))
    },
  }
}
