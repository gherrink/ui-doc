import autoprefixer from 'autoprefixer'
import postcssExtend from 'postcss-extend'
import postcssImport from 'postcss-import'
import postcssNested from 'postcss-nested'

export default {
  plugins: [postcssImport(), postcssNested(), postcssExtend(), autoprefixer()],
}
