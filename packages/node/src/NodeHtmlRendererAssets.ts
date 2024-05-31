import fs from 'node:fs/promises'
import path from 'node:path'

export class NodeHtmlRendererAssets {
  public static readonly assets: Record<string, string> = {
    style: '@styleguide/html-renderer/styleguide.css',
  }

  public static async copyStyle(dest: string, style: string = NodeHtmlRendererAssets.assets.style): Promise<void> {
    return NodeHtmlRendererAssets.copy(style, dest)
  }

  public static async copy(asset: string, as: string): Promise<void> {
    const file = await NodeHtmlRendererAssets.resolve(asset)

    if (!file) {
      throw new Error(`Asset not found: ${asset}`)
    }

    await fs.copyFile(file, as)
  }

  public static async content(asset: string): Promise<string> {
    const file = await NodeHtmlRendererAssets.resolve(asset)

    if (!file) {
      throw new Error(`Asset not found: ${asset}`)
    }

    return fs.readFile(file, 'utf8')
  }

  public static async resolve(file: string): Promise<string> {
    const resolvedFile = path.resolve(file)

    if (await fs.access(resolvedFile, fs.constants.F_OK).then(() => true).catch(() => false)) {
      return resolvedFile
    }

    return require.resolve(file)
  }
}
