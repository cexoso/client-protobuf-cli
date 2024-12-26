import { readFileSync, writeFileSync } from 'fs'
import { deleteAsync } from 'del'
import ts from 'gulp-typescript'
import gulp from 'gulp'

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
  return gulp
    .src(['**/*.ts', '!**/*.spec.ts', '!**/*.d.ts', '!dist/**/*', '!node_modules/**/*'])
    .pipe(tsProject())
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
