(() => {
  // Манифест и описание проекта меняются каждые 10 секунд.
  const tabs = document.querySelectorAll('.manifest-tabs [role="tab"]')
  let fillAnimation

  function selectTab(index) {
    fillAnimation?.cancel()
    tabs.forEach((tab, number) => {
      const selected = number === index
      tab.setAttribute('aria-selected', selected)
      tab.tabIndex = selected ? 0 : -1
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected
    })
    fillAnimation = tabs[index].querySelector('.tab-fill').animate(
      [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
      { duration: 10000, easing: 'linear', fill: 'forwards' }
    )
    fillAnimation.onfinish = () => selectTab((index + 1) % tabs.length)
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(index))
    tab.addEventListener('keydown', (event) => {
      let next = index
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
      else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = tabs.length - 1
      else return
      event.preventDefault()
      selectTab(next)
      tabs[next].focus()
    })
  })
  selectTab(0)

  // Слайдер статей, гайдов и трендов.
  const slider = document.querySelector('.rubric-slider')
  const slides = slider.querySelectorAll('.rubric-slide')
  const buttons = slider.querySelectorAll('[data-rubric]')
  const previous = slider.querySelector('.rubric-prev')
  const next = slider.querySelector('.rubric-next')
  const title = slider.querySelector('#rubric-title')
  const description = slider.querySelector('#rubric-description')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const rubrics = [
    { title: 'Статьи', description: 'Большие тексты о том, как запах работает с памятью, настроением и погодой.' },
    { title: 'Гайды', description: 'Практика короткими шагами: выбрать, нанести, сохранить.' },
    { title: 'Тренды', description: 'Что происходит в парфюмерии сейчас — и на какой стадии каждый тренд.' }
  ]
  let current = 0

  function showSlide(index, animate = true) {
    if (index < 0 || index >= slides.length) return
    current = index
    slider.style.setProperty('--slide-index', index)
    title.textContent = rubrics[index].title
    description.textContent = rubrics[index].description
    slides.forEach((slide, number) => {
      slide.inert = number !== index
      slide.setAttribute('aria-hidden', number !== index)
      buttons[number].setAttribute('aria-pressed', number === index)
    })
    previous.hidden = index === 0
    previous.disabled = previous.hidden
    next.hidden = index === slides.length - 1
    next.disabled = next.hidden
    if (!animate) return
    slider.querySelector('#rubric-announcement').textContent = `Рубрика: ${rubrics[index].title}`
    if (!reducedMotion.matches) {
      [title, description].forEach((element) => element.animate(
        [{ opacity: .25, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 350, easing: 'ease-out' }
      ))
    }
  }

  previous.addEventListener('click', () => showSlide(current - 1))
  next.addEventListener('click', () => showSlide(current + 1))
  buttons.forEach((button, index) => button.addEventListener('click', () => showSlide(index)))
  slider.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    showSlide(current + (event.key === 'ArrowRight' ? 1 : -1))
    buttons[current].focus({ preventScroll: true })
  })

  // Свайп срабатывает только при горизонтальном движении пальца.
  let startX = 0
  let startY = 0
  const viewport = slider.querySelector('.rubric-window')
  viewport.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX
    startY = event.touches[0].clientY
  }, { passive: true })
  viewport.addEventListener('touchend', (event) => {
    const dx = event.changedTouches[0].clientX - startX
    const dy = event.changedTouches[0].clientY - startY
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      showSlide(current + (dx < 0 ? 1 : -1))
    }
  }, { passive: true })
  showSlide(0, false)
})()
