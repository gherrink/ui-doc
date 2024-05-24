import fs from 'node:fs/promises'

export class NodeFileReader {
  public async content(file: string): Promise<string> {
    return fs.readFile(file, 'utf8')
  }
}
