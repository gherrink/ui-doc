import { BlockParseError, Styleguide } from '@styleguide/core'
import {
  HtmlRenderer,
  HTMLRendererSyntaxError,
  NodeParser,
  TemplateLoader,
} from '@styleguide/html-renderer'
import { NodeFileSystem } from '@styleguide/node'

// TODO clean up output directory
// TODO make it run parallel
async function main() {
  const outputDir = './dist/base'
  const fileSystem = new NodeFileSystem()
  const assetLoader = fileSystem.assetLoader()
  const renderer = new HtmlRenderer(NodeParser.init())
  const finder = fileSystem.createFileFinder(['css/**/*.css'])

  try {
    await TemplateLoader.load({
      fileSystem,
      renderer,
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

  const styleguide = new Styleguide({
    renderer,
  })

  try {
    await finder.search(async file => {
      styleguide.sourceCreate(file, await fileSystem.fileRead(file))
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
  await styleguide.output(async (file, content) => {
    await fileSystem.fileWrite(`${outputDir}/${file}`, content)
  })
  await assetLoader.copy(
    '@styleguide/html-renderer/styleguide.min.css',
    `${outputDir}/styleguide.css`,
  )
  await assetLoader.copy(
    '@styleguide/html-renderer/styleguide.min.js',
    `${outputDir}/styleguide.js`,
  )
  await assetLoader.copy(
    '@highlightjs/cdn-assets/styles/default.min.css',
    `${outputDir}/highlight.css`,
  )
  await assetLoader.copy('@highlightjs/cdn-assets/highlight.min.js', `${outputDir}/highlight.js`)
}

main()
