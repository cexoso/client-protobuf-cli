import { describe, it, expect } from 'vitest'
import { HelloApp } from '../../app'
import { Greeter } from './greeter'

describe('greeter 单元测试上的支持', () => {
  describe('sayHello', () => {
    it('正常的请求', () => {
      const container = HelloApp.createApp().createRequestContainer()
      const greeter = container.get(Greeter)
      expect(greeter.sayHello({ name: 'jie' })).deep.eq({ message: 'hello jie' })
    })
  })
  it('异常处理', () => {
    const container = HelloApp.createApp().createRequestContainer()
    const greeter = container.get(Greeter)

    expect(() => greeter.sayHello({ name: 'a_very_long_name' })).throw('name length must be less than 11')
  })
})
