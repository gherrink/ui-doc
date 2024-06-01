export function initExample() {
  document.querySelectorAll<HTMLIFrameElement>('[data-example] > iframe').forEach(iframe => {
    iframe.addEventListener('load', () => {
      if (!iframe.contentWindow) {
        return
      }

      const changeHeight = () => {
        if (iframe.contentWindow) {
          iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight}px`
        }
      }

      changeHeight()

      const observer = new MutationObserver(changeHeight)

      observer.observe(iframe.contentWindow.document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })
    })
  })
}
