import { ServiceCodeGenerater } from '../generate-service-code/generate-service-code'
import { ServiceViewModel } from '../pb-loader/pb-loader'
import { dash, camel } from 'radash'
import { File } from './file'

export class GenerateServiceFiles {
  getFiles() {
    return this.#files
  }
  #files: File[] = []
  generateServiceFilesByViewModel(viewModel: ServiceViewModel[], opts?: { serviceName?: string }) {
    const files = viewModel.map(({ serviceId, serviceName, methods }) => {
      const defualtServiceName = dash(serviceName)
      const serviceCodeGenerater = new ServiceCodeGenerater()
      methods.map((method) => {
        const { methodId, requestType, responseType } = method
        serviceCodeGenerater.generateEncodeCode(requestType)
        serviceCodeGenerater.generateMessageInterface(requestType)
        serviceCodeGenerater.generateDecodeCode(responseType)
        serviceCodeGenerater.generateMessageInterface(responseType)
        serviceCodeGenerater.generateRequestor(method.originMethod, {
          fnsServiceName: opts?.serviceName ?? defualtServiceName,
        })
      })
      const file = new File(camel(serviceName))
      const {
        requestorImports,
        decodeMessageImports,
        encodeMessageIMports,
        interfaces,
        encodeMessageCodes,
        decodeMessageCodes,
        requestors,
      } = serviceCodeGenerater.toFiles()
      file.write(
        requestorImports
          .merge(decodeMessageImports)
          .merge(encodeMessageIMports)
          .toImportsDeclare()
          .join('\n')
      )
      file.write(`const serviceId = 0x${serviceId.toString(16)}`)

      file.write(interfaces.join('\n'))
      file.write(encodeMessageCodes.join('\n'))
      file.write(decodeMessageCodes.join('\n'))
      file.write(requestors.join('\n'))
      return file
    })

    this.#files.push(...files)
  }
}
