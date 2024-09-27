function createSidebar(sidebar: HTMLElement) {
  const links: Record<string, HTMLLinkElement> = {}
  const observer = new IntersectionObserver(
    entries => {
      const activeEntries = entries.filter(entry => entry.isIntersecting)

      if (activeEntries.length <= 0) {
        return
      }

      Object.keys(links).forEach(id => {
        links[id].classList.remove('active')
      })

      const activeLink = links[activeEntries[0].target.id]

      activeLink.classList.add('active')
      if (activeLink?.parentElement?.parentElement?.parentElement instanceof HTMLLIElement) {
        activeLink.parentElement.parentElement.parentElement
          .querySelector('a')
          ?.classList.add('active')
      }
    },
    {
      root: null,
      rootMargin: '0px 0px -90% 0px',
      threshold: 0.5,
    },
  )

  sidebar.querySelectorAll<HTMLLinkElement>('a[href^="#"]').forEach(link => {
    const id = link.href.split('#')[1]
    const target = document.getElementById(id)

    if (target) {
      observer.observe(target)
      links[id] = link
    }
  })
}

export function initSidebar() {
  document.querySelectorAll('[data-sidebar]').forEach(sidebar => {
    createSidebar(sidebar as HTMLElement)
  })
}
