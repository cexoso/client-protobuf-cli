import { readFileSync, writeFileSync } from 'fs'
import { deleteAsync } from 'del'
import ts from 'gulp-typescript'
import gulp from 'gulp'
import { Buffer } from 'buffer'
import through from 'through2'
import { transformPath, transformTo } from './transforms/transform-path'
import { transformContent } from './transforms/transform-contents'
import { extname } from 'path'

interface Package {
  name: string
  module?: string
  main?: string
  type?: string
  dependencies: Record<string, string>
  repository: string
  license: string
  version: string
}

function createPkg(format: string[]) {
  const hasESM = format.includes('ESM')
  const hasCommonJS = format.includes('CommonJS')
  return () => {
    const pkg = JSON.parse(readFileSync('./package.json').toString())

    const main = pkg.publishConfig?.main ?? pkg.main ?? 'index.js'

    const newPkg: Package = {
      name: pkg.name,
      dependencies: pkg.dependencies,
      repository: pkg.repository,
      license: pkg.license,
      version: pkg.version,
    }

    if (hasCommonJS) {
      newPkg.main = transformTo(main, '.js')
    }

    if (hasESM) {
      newPkg.module = transformTo(main, '.mjs')
    }

    if (format.length === 1 && hasESM) {
      newPkg.type = 'module'
    }

    writeFileSync('./dist/package.json', JSON.stringify(newPkg, null, 2))
  }
}

function buildESM() {
  const transform = transformPath({
    '.js': '.mjs',
  })
  const tsProject = ts.createProject('tsconfig.json', {
    module: 'esnext',
    moduleResolution: 'node',
  })
  return gulp
    .src(['**/*.ts', '!**/*.spec.ts', '!**/*.d.ts', '!dist/**/*', '!node_modules/**/*'])
    .pipe(tsProject())
    .pipe(
      through.obj(async (file, _enc, cb) => {
        const path = file.path
        file.path = transform(path)
        const content = file.contents.toString()
        if (extname(path) === '.js') {
          file.contents = Buffer.from(transformContent(content))
        }

        cb(null, file)
      })
    )
    .pipe(gulp.dest('./dist'))
}

// 将非 ts 的文件通通移过去
function cpOtherFile() {
  return gulp.src(['src/**/*', '!**/*.ts']).pipe(gulp.dest('./dist/src/'))
}

function buildCommonJS() {
  const tsProject = ts.createProject('tsconfig.json', {
    module: 'CommonJS',
    moduleResolution: 'node',
  })
  return gulp
    .src(['**/*.ts', '!**/*.spec.ts', '!**/*.d.ts', '!dist/**/*', '!node_modules/**/*'])
    .pipe(tsProject())
    .pipe(gulp.dest('./dist'))
}

function getParallelBuild(format: string[]) {
  const parallelBuild = []
  if (format.includes('ESM')) {
    parallelBuild.push(buildESM)
  }
  if (format.includes('CommonJS')) {
    parallelBuild.push(buildCommonJS)
  }
  return parallelBuild
}

export const build = (opts: { format: Array<'ESM' | 'CommonJS'> }): any => {
  const parallelBuild = getParallelBuild(opts.format)
  const compilePackage = gulp.series(
    async () => {
      await deleteAsync('./dist')
    },
    gulp.parallel(...parallelBuild),
    cpOtherFile,
    createPkg(opts.format)
  )

  return compilePackage(() => {})
}
