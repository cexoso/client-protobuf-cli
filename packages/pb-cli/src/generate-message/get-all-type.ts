import { Namespace, Type, Service } from 'protobufjs'

// 函数用于递归获取所有 message 定义
export function getAllMessages(namespace: Namespace) {
  let messages: Type[] = []

  namespace.nestedArray.forEach((nested) => {
    if (nested instanceof Type) {
      messages.push(nested)
    }
    if (nested instanceof Namespace) {
      messages = messages.concat(getAllMessages(nested))
    }
  })

  return messages
}

// 函数用于递归获取所有 service 定义
export function getAllService(namespace: Namespace) {
  let messages: Service[] = []

  namespace.nestedArray.forEach((nested) => {
    if (nested instanceof Service) {
      messages.push(nested)
    }
    if (nested instanceof Namespace) {
      messages = messages.concat(getAllService(nested))
    }
  })

  return messages
}
