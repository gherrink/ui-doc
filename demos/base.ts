import { Styleguide } from '@styleguide/core'
import { HtmlRenderer, Parser } from '@styleguide/html-renderer'
import {
  NodeFileReader,
  NodeFileWriter,
  NodeHtmlRendererTemplateLoader,
  NodeSourceScanner,
} from '@styleguide/node'
import { NodeHtmlRendererAssets } from 'packages/node/src/NodeHtmlRendererAssets'

// TODO clean up output directory
// TODO make it run parallel
async function main() {
  const outputDir = './dist/base'
  const renderer = new HtmlRenderer(Parser.init())
  const reader = new NodeFileReader()
  const writer = new NodeFileWriter(outputDir)
  const scanner = new NodeSourceScanner(['css/**/*.css'], reader)

  await NodeHtmlRendererTemplateLoader.load(renderer)
  await NodeHtmlRendererAssets.copyStyle(`${outputDir}/styleguide.css`)

  const styleguide = new Styleguide({
    renderer,
  })

  await scanner.scan(async (file, content) => {
    await styleguide.sourceCreate(file, content)
  })

  await styleguide.output((file, content) => writer.write(file, content))
}

main()
