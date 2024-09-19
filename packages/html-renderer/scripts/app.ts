import { initExample } from './src/example'
import { initSidebar } from './src/sidebar'
import { ready } from './src/utils'

ready(() => {
  initExample()
  initSidebar()
})
