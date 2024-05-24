import { FileWriter } from '@styleguide/core'
import fs from 'node:fs/promises'
import path from 'node:path'

export class NodeFileWriter implements FileWriter {
  protected outputDir = '.'

  constructor(outputDir: string) {
    this.outputDir = outputDir
    this.ensureDirectoryExists(outputDir)
  }

  public async write(file: string, content: string): Promise<boolean> {
    const outputFile = path.resolve(path.join(this.outputDir, file))

    try {
      await this.ensureDirectoryExists(outputFile)
      await fs.writeFile(outputFile, content, 'utf8')

      return true
    } catch (e) {
      return false
    }
  }

  protected async ensureDirectoryExists(dir: string): Promise<void> {
    await fs.mkdir(path.resolve(path.dirname(dir)), { recursive: true })
  }
}
