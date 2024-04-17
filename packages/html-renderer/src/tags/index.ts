import debug from './debug'
import forLoop from './for'
import condition from './if'
import page from './page'
import partial from './partial'
import partialContext from './partial-context'
import variable from './var'
import varEscaped from './var-escaped'

export default {
  debug,
  for: forLoop,
  if: condition,
  page,
  partial,
  'partial-context': partialContext,
  var: variable,
  'var-escaped': varEscaped,
}
