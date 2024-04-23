import fs from 'fs'

import { FileReader } from '../../core/src/types'

export class NodeFileReader implements FileReader {
  content(file: string): string {
    return fs.readFileSync(file, 'utf8')
  }
}
