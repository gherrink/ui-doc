export function initExample() {
  document.querySelectorAll<HTMLIFrameElement>('[data-example] > iframe').forEach(iframe => {
    const document = iframe.contentDocument ?? iframe.contentWindow?.document

    if (!document) {
      return
    }

    const action = () => {
      const changeHeight = () => {
        iframe.style.height = `${document.body.scrollHeight}px`
      }

      changeHeight()

      const observer = new MutationObserver(changeHeight)

      observer.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    }

    if (document.readyState === 'complete') {
      action()
    } else {
      iframe.addEventListener('load', action)
    }
  })
}
