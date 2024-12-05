import synchronizedPrettier from '@prettier/sync'
const resolvePrettierConfig = () => {
  const string = synchronizedPrettier.resolveConfigFile()
  return synchronizedPrettier.resolveConfig(string!)
}
const prettierConfig = resolvePrettierConfig()

export function formatTypescript(content: string) {
  return synchronizedPrettier.format(content, {
    ...prettierConfig,
    parser: 'typescript',
  })
}
