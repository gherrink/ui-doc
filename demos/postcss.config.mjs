import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'

export default {
  // postcssImport must run first so @import-ed files are inlined before nesting
  // is flattened. postcssPresetEnv runs autoprefixer internally.
  plugins: [postcssImport(), postcssPresetEnv()],
}
