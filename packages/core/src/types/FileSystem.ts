import type { AssetLoader } from './AssetLoader'
import type { FileFinder } from './FileFinder'

export type FilePath = string

export interface FileSystem {
  createFileFinder(globs: string[]): FileFinder
  assetLoader(): AssetLoader
  fileRead(file: FilePath): Promise<string>
  fileWrite(file: FilePath, content: string): Promise<boolean>
  fileCopy(from: FilePath, to: FilePath): Promise<boolean>
  fileExists(file: FilePath): Promise<boolean>
  fileBasename(file: FilePath): string
  fileDirname(file: FilePath): string
}
