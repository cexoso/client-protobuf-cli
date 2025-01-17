import { transformContent } from './transform-contents'
import { extname } from 'path'
import through from 'through2'
import { transformPath } from './transform-path'
export function transformAllJsFileTask() {
  const transform = transformPath({
    '.js': '.mjs',
  })
  return through.obj(async (file, _enc, cb) => {
    const path = file.path
    file.path = transform(path)
    const content = file.contents.toString()
    if (extname(path) === '.js') {
      file.contents = Buffer.from(transformContent(content, path))
    }

    cb(null, file)
  })
}
