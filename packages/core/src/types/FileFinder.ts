import type { FilePath } from './FileSystem'

export type FileFinderOnFoundCallback = (file: FilePath) => Promise<void> | void

export interface FileFinder {
  search(onFound: FileFinderOnFoundCallback): Promise<void>
  matches(file: FilePath): boolean
}
