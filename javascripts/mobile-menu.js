(() => {
  const menu = document.querySelector('.mobile-menu')
  const openButton = document.querySelector('[data-menu-open]')
  const closeButton = document.querySelector('[data-menu-close]')
  const mobile = window.matchMedia('(max-width: 760px)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let animation
  let closing = false

  // Круг начинается в центре кнопки и доходит до дальнего угла экрана.
  function getCircle() {
    const button = openButton.getBoundingClientRect()
    const x = button.left + button.width / 2
    const y = button.top + button.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 2
    return {
      small: `circle(0px at ${x}px ${y}px)`,
      big: `circle(${radius}px at ${x}px ${y}px)`
    }
  }

  function finishClose() {
    animation?.cancel()
    menu.close()
    menu.style.clipPath = ''
    document.documentElement.style.overflow = ''
    openButton.setAttribute('aria-expanded', 'false')
    closing = false
    if (mobile.matches) openButton.focus({ preventScroll: true })
  }

  function openMenu() {
    const circle = getCircle()
    menu.showModal()
    document.documentElement.style.overflow = 'hidden'
    openButton.setAttribute('aria-expanded', 'true')
    closeButton.focus({ preventScroll: true })
    if (reducedMotion.matches) return

    animation = menu.animate(
      [{ clipPath: circle.small }, { clipPath: circle.big }],
      { duration: 650, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' }
    )
    animation.onfinish = () => {
      menu.style.clipPath = 'none'
      animation.cancel()
    }
  }

  function closeMenu() {
    if (closing) return
    if (reducedMotion.matches) return finishClose()
    closing = true
    const circle = getCircle()
    const current = getComputedStyle(menu).clipPath
    animation?.cancel()
    animation = menu.animate(
      [{ clipPath: current === 'none' ? circle.big : current }, { clipPath: circle.small }],
      { duration: 480, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }
    )
    animation.onfinish = finishClose
  }

  openButton.addEventListener('click', openMenu)
  closeButton.addEventListener('click', closeMenu)
  menu.addEventListener('cancel', (event) => {
    event.preventDefault()
    closeMenu()
  })
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', finishClose))
  mobile.addEventListener('change', () => {
    if (!mobile.matches && menu.open) finishClose()
  })
  window.addEventListener('pagehide', () => {
    if (menu.open) finishClose()
  })
})()
