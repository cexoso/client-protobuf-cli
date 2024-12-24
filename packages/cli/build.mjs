import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'glob'
import { build as tsBuild } from 'tsup'

export const build = async () => {
  const files = globSync(['**/*.ts'], {
    ignore: ['**/*.spec.ts', '**/*.d.ts', 'dist/**/*'],
  })

  await tsBuild({
    entry: files,
    dts: true,
    splitting: false,
    clean: true,
    format: ['cjs'],
  })

  const pkg = JSON.parse(readFileSync('./package.json').toString())

  const newPkg = {
    name: pkg.name,
    dependencies: pkg.dependencies,
    version: pkg.version,
    main: 'index.js',
  }

  writeFileSync('./dist/package.json', JSON.stringify(newPkg, null, 2))
}
