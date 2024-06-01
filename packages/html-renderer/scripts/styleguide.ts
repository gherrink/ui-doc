import { ready } from './src/base'
import { initExample } from './src/example'
import { initSidebar } from './src/sidebar'

ready(() => {
  initExample()
  initSidebar()
})
