export function initExample(): void {
  document.querySelectorAll<HTMLIFrameElement>('[data-example] > iframe').forEach(iframe => {
    const frameDocument = (): Document | undefined =>
      iframe.contentDocument ?? iframe.contentWindow?.document

    const initHeightChange = (): void => {
      // Resolved here rather than captured when the listener is registered.
      // Before load, contentDocument is the initial about:blank placeholder,
      // and the frame swaps in the document it actually loads. Holding the
      // placeholder meant measuring and observing a document the frame no
      // longer shows.
      const contentDocument = frameDocument()

      if (!contentDocument) {
        return
      }

      let currentHeight = 0
      const changeHeight = (): void => {
        if (contentDocument.body.scrollHeight === currentHeight) {
          return
        }

        currentHeight = contentDocument.body.scrollHeight
        iframe.style.height = `${currentHeight}px`
      }

      // Initial height change
      changeHeight()

      // Use MutationObserver to detect changes in the DOM and change height if required
      const mutationObserver = new MutationObserver(changeHeight)

      mutationObserver.observe(contentDocument.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })

      // Use ResizeObserver to detect changes in the viewport and change height if required
      const resizeObserver = new ResizeObserver(changeHeight)

      resizeObserver.observe(contentDocument.body)
    }

    if (frameDocument()?.readyState === 'complete') {
      initHeightChange()
    } else {
      iframe.addEventListener('load', initHeightChange)
    }
  })
}
