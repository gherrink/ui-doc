import { BlockParseError, UIDoc } from '@ui-doc/core'
import {
  HtmlRenderer,
  HTMLRendererSyntaxError,
  NodeParser,
  TemplateLoader,
} from '@ui-doc/html-renderer'
import { NodeFileSystem } from '@ui-doc/node'

// TODO clean up output directory
// TODO make it run parallel
async function main() {
  const outputDir = './dist/base'
  const fileSystem = new NodeFileSystem()
  const assetLoader = fileSystem.assetLoader()
  const renderer = new HtmlRenderer(NodeParser.init())
  const finder = fileSystem.createFileFinder(['css/**/*.css'])
  const templatePath = await assetLoader.packagePath(TemplateLoader.TEMPLATES_PACKAGE)

  if (!templatePath) {
    console.error(`Template path '${TemplateLoader.TEMPLATES_PACKAGE}' not found`)
  }

  try {
    await TemplateLoader.load({
      fileSystem,
      renderer,
      templatePath: templatePath!,
    })
  } catch (e) {
    if (e instanceof HTMLRendererSyntaxError) {
      console.error(`HTMLRendererSyntaxError: ${e.message}`)
      console.error(e.stack)
    } else {
      throw e
    }
    return
  }

  const uidoc = new UIDoc({
    renderer,
  })

  try {
    await finder.search(async file => {
      uidoc.sourceCreate(file, await fileSystem.fileRead(file))
    })
  } catch (e) {
    if (e instanceof BlockParseError) {
      console.error(`BlockParserError: ${e.message}`)
      console.error(e.stack)
    } else {
      throw e
    }
  }

  await fileSystem.ensureDirectoryExists(outputDir)
  await fileSystem.ensureDirectoryExists(`${outputDir}/examples`)
  await uidoc.output(async (file, content) => {
    await fileSystem.fileWrite(`${outputDir}/${file}`, content)
  })
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.css', `${outputDir}/ui-doc.css`)
  await assetLoader.copy('@ui-doc/html-renderer/ui-doc.min.js', `${outputDir}/ui-doc.js`)
  await assetLoader.copy(
    '@highlightjs/cdn-assets/styles/default.min.css',
    `${outputDir}/highlight.css`,
  )
  await assetLoader.copy('@highlightjs/cdn-assets/highlight.min.js', `${outputDir}/highlight.js`)
}

main()
