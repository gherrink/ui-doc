import { initExample } from './services/example'
import { initExpand } from './services/expand'
import { initSidebar } from './services/sidebar'
import { ready } from './utils/dom'

ready(() => {
  initExpand()
  initExample()
  initSidebar()
})
