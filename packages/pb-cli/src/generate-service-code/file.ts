import { formatTypescript } from '../prettier'

export class File {
  #content: string[] = []
  constructor(private name: string, private ext = 'ts') {}
  isFile(name: string) {
    return this.name === name
  }
  write(content: string) {
    this.#content.push(content)
  }
  get fileName() {
    return this.name + '.' + this.ext
  }
  toString() {
    const content = this.#content.join('\n')
    if (this.ext === 'ts') {
      return formatTypescript(content)
    }
    return content
  }
}
