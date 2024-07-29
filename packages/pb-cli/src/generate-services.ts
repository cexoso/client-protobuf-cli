import { writeFileSync } from 'fs'
import { loadPBfromLocalPath } from './pb-loader/pb-loader'
import { GenerateServiceFiles } from './generate-service-code/generate-service-files'
import { File } from './generate-service-code/file'
import { join } from 'path'

const writeToFiles = (filesJob: File[], out: string) => {
  filesJob.map((file) => {
    const fileName = file.fileName
    const content = file.toString()
    writeFileSync(join(out, fileName), content)
  })
}

export async function generatePackage(opts: {
  absolutePath?: string | null
  serviceName?: string | null
  dryRun?: boolean
  out: string
}) {
  const files: File[] = []
  const out = opts.out
  const { absolutePath, serviceName } = opts
  if (absolutePath && serviceName) {
    const result = await loadPBfromLocalPath({ absolutePath })
    const generateServiceFiles = new GenerateServiceFiles()
    generateServiceFiles.generateServiceFilesByViewModel(result.getServicesViewModel(), {
      serviceName,
    })
    files.push(...generateServiceFiles.getFiles())
  }

  if (!opts.dryRun) {
    writeToFiles(files, out)
  }
  return files
}
