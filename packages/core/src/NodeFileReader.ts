import fs from 'fs'

import { FileReader } from './types'

export class NodeFileReader implements FileReader {
  content(file: string): string {
    return fs.readFileSync(file, 'utf8')
  }
}
