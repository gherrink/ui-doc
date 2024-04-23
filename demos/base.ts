import { Styleguide } from '@styleguide/core'
import { HtmlRenderer } from '@styleguide/html-renderer'
import { NodeFileFinder, NodeFileReader, NodeFileWriter } from '@styleguide/node'
import { BaseSourceListener } from 'packages/core/src/BaseSourceListener'
import path from 'path'

// TODO fix imports

const finder = new NodeFileFinder()
const writer = new NodeFileWriter('./dist/base')
const reader = new NodeFileReader()
const listener = new BaseSourceListener({
  globs: ['css/**/*.css'],
}, finder)
const renderer = new HtmlRenderer()

const templatesPath = path.resolve('../packages/html-renderer/templates')

finder.scan([`${templatesPath}/layouts/*.html`], file => {
  renderer.addLayout(path.basename(file, path.extname(file)), reader.content(file).trim())
})

finder.scan([`${templatesPath}/pages/*.html`], file => {
  renderer.addPage(path.basename(file, path.extname(file)), reader.content(file).trim())
})

finder.scan([`${templatesPath}/partials/*.html`], file => {
  renderer.addPartial(path.basename(file, path.extname(file)), reader.content(file).trim())
})

const styleguide: Styleguide = new Styleguide({
  reader,
  writer,
  listener,
  renderer,
})

styleguide.output()
