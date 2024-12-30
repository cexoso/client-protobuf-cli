import { readFileSync, writeFileSync } from 'fs'
import { deleteAsync } from 'del'
import ts from 'gulp-typescript'
import gulp from 'gulp'
import { Buffer } from 'buffer'
import through from 'through2'
import { transformPath } from './transforms/transform-path.mjs'

/**
 * @param { string } content
 */
function transformContent(content) {
  return content
}

function createPkg() {
  const pkg = JSON.parse(readFileSync('./package.json').toString())

  const main = pkg.publishConfig?.main ?? pkg.main ?? 'index.js'
  const newPkg = {
    name: pkg.name,
    dependencies: pkg.dependencies,
    repository: pkg.repository,
    license: pkg.license,
    version: pkg.version,
    main,
  }

  writeFileSync('./dist/package.json', JSON.stringify(newPkg, null, 2))
}

function buildTs() {
  const tsProject = ts.createProject('tsconfig.json')
  const transform = transformPath({
    '.js': '.mjs',
  })
  return gulp
    .src(['**/*.ts', '!**/*.spec.ts', '!**/*.d.ts', '!dist/**/*', '!node_modules/**/*'])
    .pipe(tsProject())
    .pipe(
      through.obj((file, enc, cb) => {
        const path = file.path
        file.path = transform(path)
        const content = file.contents.toString()
        file.contents = Buffer.from(transformContent(content))

        cb(null, file)
      })
      // tap((file) => {
      //   console.log('debugger 🐛 file', file.path)
      // })
    )
    .pipe(gulp.dest('./dist'))
}

// 将非 ts 的文件通通移过去
function cpOtherFile() {
  return gulp.src(['src/**/*', '!**/*.ts']).pipe(gulp.dest('./dist/src/'))
}
const compilePackage = gulp.series(
  async () => {
    await deleteAsync('./dist')
  },
  buildTs,
  cpOtherFile,
  createPkg
)

export const build = compilePackage
