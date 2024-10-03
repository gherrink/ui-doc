import type { FileSystem } from '@ui-doc/core'

import type { HtmlRenderer } from './HtmlRenderer'

export class TemplateLoader {
  public static readonly TEMPLATES_PACKAGE: string = '@ui-doc/html-renderer/templates'

  public static async load({
    renderer,
    fileSystem,
    templatePath,
  }: {
    renderer: HtmlRenderer
    fileSystem: FileSystem
    templatePath: string
  }): Promise<void> {
    const paths: { folderName: string; addFunction: 'addLayout' | 'addPage' | 'addPartial' }[] = [
      { folderName: 'layouts', addFunction: 'addLayout' },
      { folderName: 'pages', addFunction: 'addPage' },
      { folderName: 'partials', addFunction: 'addPartial' },
    ]
    const promises = []

    paths.forEach(async ({ folderName, addFunction }) => {
      const searchPath = `${templatePath}/${folderName}`

      if (!(await fileSystem.isDirectory(searchPath))) {
        return
      }

      const finder = fileSystem.createFileFinder([`${searchPath}/*.html`])

      promises.push(
        finder.search(async file => {
          renderer[addFunction](fileSystem.fileBasename(file), {
            content: (await fileSystem.fileRead(file)).trim(),
            source: file,
          })
        }),
      )
    })
  }
}
