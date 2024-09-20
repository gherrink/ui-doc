export function initExample() {
  document.querySelectorAll<HTMLIFrameElement>('[data-example] > iframe').forEach(iframe => {
    const document = iframe.contentDocument ?? iframe.contentWindow?.document

    if (!document) {
      return
    }

    const initHeightChange = () => {
      let currentHeight = 0
      const changeHeight = () => {
        if (document.body.scrollHeight === currentHeight) {
          return
        }

        currentHeight = document.body.scrollHeight
        iframe.style.height = `${currentHeight}px`
      }

      // Initial height change
      changeHeight()

      // Use MutationObserver to detect changes in the DOM and change height if required
      const mutationObserver = new MutationObserver(changeHeight)

      mutationObserver.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })

      // Use ResizeObserver to detect changes in the viewport and change height if required
      const resizeObserver = new ResizeObserver(changeHeight)

      resizeObserver.observe(document.body)
    }

    if (document.readyState === 'complete') {
      initHeightChange()
    } else {
      iframe.addEventListener('load', initHeightChange)
    }
  })
}
