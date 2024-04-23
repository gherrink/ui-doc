import debug from './debug'
import forLoop from './for'
import condition from './if'
import layoutUrlEncoded from './layout-url-encoded'
import page from './page'
import partial from './partial'
import partialContext from './partial-context'
import variable from './var'
import varEscaped from './var-escaped'

export default {
  if: condition,
  for: forLoop,
  var: variable,
  'var-escaped': varEscaped,
  partial,
  'partial-context': partialContext,
  page,
  'layout-url-encoded': layoutUrlEncoded,
  debug,
}
