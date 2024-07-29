import { readFileSync, writeFileSync } from 'fs'
import ts from 'gulp-typescript'
import { extname } from 'path'
import { series, parallel, src, dest } from 'gulp'
import { transformTo } from './transforms/transform-path'
import { transformAllJsFileTask } from './transforms'
import { deleteAsync } from './clean'

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

    const main = pkg.publishConfig?.main ?? pkg.main ?? ''
    const module = pkg.publishConfig?.module ?? pkg.module ?? ''
    // TODO: 仅编译 ESM 在使用 mjs 文件下编写代码会有问题

    const newPkg: Package = {
      ...pkg,
    }

    if (hasCommonJS && main) {
      newPkg.main = transformTo(main ?? module, '.js')
    }

    if (hasESM && module) {
      newPkg.module = transformTo(module ?? main, '.mjs')
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

    if (pkg.exports) {
      // 这里只能处理类型，以下结构类型的
      // "exports": {
      // ".": "./dist/index.js",
      // "./package": "./package.json",
      // "./package.json": "./package.json",
      // }
      for (const [k, v] of Object.entries(pkg.exports)) {
        if (typeof v === 'string') {
          if (extname(v) === '.json') {
            continue
          }
          if (format.length !== 1) {
            pkg.exports[k] = {
              require: transformTo(v, '.js'),
              import: transformTo(v, '.mjs'),
              types: transformTo(v, '.d.ts'),
            }
          } else {
            pkg.exports[k] = transformTo(v, hasCommonJS ? '.js' : '.mjs')
          }
        } else {
          throw new Error(`暂不支持的 exports 配置：${pkg.exports}, name: ${pkg.name}`)
        }
      }
    }

    if (process.env['CHANGE_LINK_DIRECTORY'] === 'true') {
      // 这个改动是用于修复 pnpm deploy 时不会应用 publishConfig 的bug
      if (pkg.publishConfig) {
        pkg.publishConfig.linkDirectory = true
      }
      writeFileSync('./package.json', JSON.stringify(pkg, null, 2))
    }
    writeFileSync('./dist/package.json', JSON.stringify(newPkg, null, 2))
  }
}

function buildESM() {
  const tsProject = ts.createProject('tsconfig.json', {
    module: 'esnext',
    moduleResolution: 'node',
    // isolatedModules (boolean) - Compiles files seperately and doesn't check types, which causes a big speed increase. You have to use gulp-plumber and TypeScript 1.5+.
    isolatedModules: false, // isolatedModules true 会导致无法生成 d.ts
  })
  return src(['**/*.ts', '!**/*.spec.ts', '!dist/**/*', '!node_modules/**/*'])
    .pipe(tsProject())
    .pipe(transformAllJsFileTask())
    .pipe(dest('./dist'))
}

// 将非 ts 的文件通通移过去
function cpOtherFile() {
  return src(['src/**/*', '!**/*.ts']).pipe(dest('./dist/src/'))
}

function buildCommonJS() {
  const tsProject = ts.createProject('tsconfig.json', {
    module: 'node16',
    moduleResolution: 'node16',
    // 有空的时候，需要深入了解一下这里的原因，找到一个好的办法
    // isolated: false 会影响 commonjs 的生成，
    // isolated: true 会影响 d.ts 的生成，这里先暂时使用 esm 下来生成 d.ts
    isolatedModules: true,
  })
  return src(['**/*.ts', '!**/*.spec.ts', '!dist/**/*', '!node_modules/**/*'])
    .pipe(tsProject())
    .pipe(dest('./dist'))
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
  const compilePackage = series(
    async () => {
      await deleteAsync('./dist')
    },
    parallel(...parallelBuild),
    cpOtherFile,
    createPkg(opts.format)
  )

  return compilePackage(() => {})
}
