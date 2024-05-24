import { Styleguide } from '@styleguide/core'
import { HtmlRenderer } from '@styleguide/html-renderer'
import {
  NodeFileReader,
  NodeFileWriter,
  NodeHtmlRendererTemplateLoader,
  NodeSourceScanner,
} from '@styleguide/node'

// TODO clean up output directory

const renderer = new HtmlRenderer()
const reader = new NodeFileReader()
const writer = new NodeFileWriter('./dist/base')
const scanner = new NodeSourceScanner(['css/**/*.css'], reader)

NodeHtmlRendererTemplateLoader.load(renderer)

const styleguide = new Styleguide({
  renderer,
})

scanner.scan((file, content) => {
  styleguide.sourceRegister(file, content)
})

styleguide.output((file, content) => writer.write(file, content))
