import { throttle } from './utils'

export function initExample() {
  const changeHeightCallbacks: (() => void)[] = []

  document.querySelectorAll<HTMLIFrameElement>('[data-example] > iframe').forEach(iframe => {
    const document = iframe.contentDocument ?? iframe.contentWindow?.document

    if (!document) {
      return
    }

    const initHeightChange = () => {
      const changeHeight = () => {
        iframe.style.height = `${document.body.scrollHeight}px`
      }

      changeHeight()
      changeHeightCallbacks.push(changeHeight)

      const observer = new MutationObserver(changeHeight)

      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    }

    if (document.readyState === 'complete') {
      initHeightChange()
    } else {
      iframe.addEventListener('load', initHeightChange)
    }
  })

  window.addEventListener(
    'resize',
    throttle(() => {
      changeHeightCallbacks.forEach(callback => callback())
    }, 200),
  )
}
