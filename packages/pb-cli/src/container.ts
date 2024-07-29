import 'reflect-metadata'
import { Container } from 'inversify'

export function createContainer() {
  const container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
  })
  return container
}
