import { FileReader } from '@styleguide/core'
import fs from 'node:fs'

export class NodeFileReader implements FileReader {
  content(file: string): string {
    return fs.readFileSync(file, 'utf8')
  }
}
