export interface AssetLoader {
  copy(from: string, to: string): Promise<void>
  packageExists(packageName: string): Promise<boolean>
  packagePath(packageName: string): Promise<string | undefined>
  read(file: string): Promise<string>
  resolve(file: string): Promise<string | undefined>
}
