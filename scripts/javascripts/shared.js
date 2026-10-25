(() => {
  const header = document.querySelector('.site-header')
  const backButton = document.querySelector('[data-back]')
  let lastScroll = window.scrollY

  // Вниз — прячем хедер, вверх — показываем.
  window.addEventListener('scroll', () => {
    const scroll = Math.max(0, Math.min(window.scrollY, document.documentElement.scrollHeight - window.innerHeight))
    if (scroll === 0 || header.querySelector(':focus-visible')) {
      header.classList.remove('is-hidden')
      lastScroll = scroll
    } else if (Math.abs(scroll - lastScroll) >= 8) {
      header.classList.toggle('is-hidden', scroll > lastScroll)
      lastScroll = scroll
    }
  }, { passive: true })

  header.addEventListener('focusin', () => header.classList.remove('is-hidden'))

  if (backButton) {
    backButton.addEventListener('click', (event) => {
      if (history.length > 1) {
        event.preventDefault()
        history.back()
      }
    })
  }
})()
