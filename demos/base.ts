import { Styleguide } from '@styleguide/core'
import { HtmlRenderer, Parser } from '@styleguide/html-renderer'
import {
  NodeFileReader,
  NodeFileWriter,
  NodeHtmlRendererTemplateLoader,
  NodeSourceScanner,
} from '@styleguide/node'

// TODO clean up output directory
async function main() {
  const renderer = new HtmlRenderer(Parser.init())
  const reader = new NodeFileReader()
  const writer = new NodeFileWriter('./dist/base')
  const scanner = new NodeSourceScanner(['css/**/*.css'], reader)

  await NodeHtmlRendererTemplateLoader.load(renderer)

  const styleguide = new Styleguide({
    renderer,
  })

  await scanner.scan(async (file, content) => {
    await styleguide.sourceCreate(file, content)
  })

  await styleguide.output((file, content) => writer.write(file, content))
}

main()
