import { FileWriter } from '@styleguide/core'
import fs from 'node:fs'
import path from 'node:path'

export class NodeFileWriter implements FileWriter {
  protected outputDir = '.'

  constructor(outputDir: string) {
    this.outputDir = outputDir
    this.ensureDirectoryExists(outputDir)
  }

  public write(file: string, content: string): boolean {
    const outputFile = path.resolve(path.join(this.outputDir, file))

    try {
      this.ensureDirectoryExists(outputFile)
      fs.writeFileSync(outputFile, content)
      return true
    } catch (e) {
      return false
    }
  }

  protected ensureDirectoryExists(dir: string): void {
    fs.mkdirSync(path.resolve(path.dirname(dir)), { recursive: true })
  }
}
