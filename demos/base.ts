import { Styleguide } from '@styleguide/core'
import { BaseFileFinder } from 'packages/core/src/BaseFileFinder'

const styleguide: Styleguide = new Styleguide({
  finder: new BaseFileFinder({
    globs: ['less/**/*.less'],
  }),
})

styleguide.load()
