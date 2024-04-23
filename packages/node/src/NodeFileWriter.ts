import { FileWriter } from '@styleguide/core'
import fs from 'node:fs'
import path from 'node:path'

export class NodeFileWriter implements FileWriter {

  protected outputDir = '.'

  constructor(outputDir: string) {
    this.outputDir = outputDir
    fs.mkdirSync(path.resolve(outputDir), { recursive: true })
  }

  write(file: string, content: string): boolean {
    try {
      fs.writeFileSync(path.resolve(path.join(this.outputDir, file)), content)
      return true
    } catch (e) {
      return false
    }
  }
}
