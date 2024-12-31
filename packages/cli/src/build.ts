import { readFileSync, writeFileSync } from 'fs'
import { deleteAsync } from 'del'
import ts from 'gulp-typescript'
import gulp from 'gulp'
import { transformTo } from './transforms/transform-path'
import { transformAllJsFileTask } from './transforms/index'

interface Package {
  name: string
  module?: string
  main?: string
  type?: string
  dependencies: Record<string, string>
  repository: string
  license: string
  version: string
  bin?: string | Record<string, string>
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

    if (pkg.bin) {
      if (typeof pkg.bin === 'string') {
        newPkg.bin = transformTo(pkg.bin, hasCommonJS ? '.js' : '.mjs')
      } else {
        newPkg.bin = {}
        for (const [k, v] of Object.entries(pkg.bin)) {
          newPkg.bin[k] = transformTo(v as string, hasCommonJS ? '.js' : '.mjs')
        }
      }
    }

    writeFileSync('./dist/package.json', JSON.stringify(newPkg, null, 2))
  }
}

function buildESM() {
  const tsProject = ts.createProject('tsconfig.json', {
    module: 'esnext',
    moduleResolution: 'node',
  })
  return gulp
    .src(['**/*.ts', '!**/*.spec.ts', '!**/*.d.ts', '!dist/**/*', '!node_modules/**/*'])
    .pipe(tsProject())
    .pipe(transformAllJsFileTask())
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
