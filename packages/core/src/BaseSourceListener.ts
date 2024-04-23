import { FileFinder, SourceListener, SourceListenerOptions } from './types'

export class BaseSourceListener implements SourceListener {
  protected fileGlobs: string[]

  protected finder: FileFinder

  protected onNewFile?: (file: string) => void

  constructor(options: SourceListenerOptions, finder: FileFinder) {
    this.fileGlobs = options.globs
    this.finder = finder
  }

  public registerOnNewFile(callback: (file: string) => void) {
    this.onNewFile = callback
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public registerOnChangeFile(callback: (file: string) => void) {}

  public scan() {
    if (!this.onNewFile) {
      throw new Error('onNewFile is not defined')
    }

    // @ts-ignore onNewFile is defined
    this.finder.scan(this.fileGlobs, file => this.onNewFile(file))
  }
}
