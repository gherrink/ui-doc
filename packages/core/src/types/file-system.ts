export type FilePath = string

export type FileFinderOnFoundCallback = (file: FilePath) => Promise<void> | void

export interface FileFinder {
  search(onFound: FileFinderOnFoundCallback): Promise<void>
  matches(file: FilePath): boolean
}

export interface AssetLoader {
  copy(from: FilePath, to: FilePath): Promise<void>
  packageExists(packageName: string): Promise<boolean>
  packagePath(packageName: string): Promise<string | undefined>
  read(file: FilePath): Promise<string>
  resolve(file: FilePath): Promise<string | undefined>
}

export interface FileSystem {
  createFileFinder(globs: string[]): FileFinder
  assetLoader(): AssetLoader
  resolve(file: FilePath): FilePath
  directoryCopy(from: FilePath, to: FilePath): Promise<boolean>
  ensureDirectoryExists(dir: FilePath): Promise<boolean>
  isDirectory(dir: FilePath): Promise<boolean>
  fileRead(file: FilePath): Promise<string>
  fileWrite(file: FilePath, content: string): Promise<boolean>
  fileCopy(from: FilePath, to: FilePath): Promise<boolean>
  fileExists(file: FilePath): Promise<boolean>
  fileBasename(file: FilePath): string
  fileDirname(file: FilePath): string
}
