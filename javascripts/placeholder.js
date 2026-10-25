(() => {
  const panel = document.querySelector('.coming-soon')
  const button = panel.querySelector('.launch-form [type="submit"]')
  const mouseDevice = window.matchMedia('(hover: hover) and (pointer: fine)')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  // Сначала появляются буквы заголовка, затем — подзаголовка.
  if (!reducedMotion.matches) {
    document.querySelectorAll('#coming-soon-title, .coming-soon-copy').forEach((text, textIndex) => {
      const label = text.textContent.replace(/\s+/g, ' ').trim()
      const letterCount = label.replace(/\s/g, '').length
      const visual = document.createElement('span')
      const accessible = document.createElement('span')
      visual.setAttribute('aria-hidden', 'true')
      accessible.className = 'visually-hidden reveal-accessible'
      accessible.textContent = label
      let letterIndex = 0

      text.childNodes.forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) {
          visual.append(node.cloneNode(true)) // Сохраняем переносы строк.
          return
        }
        node.textContent.split(/(\s+)/).forEach((part) => {
          if (!part.trim()) {
            visual.append(part)
            return
          }
          const word = document.createElement('span')
          word.className = 'reveal-word'
          for (const letter of part) {
            const character = document.createElement('span')
            character.className = 'reveal-letter'
            character.textContent = letter
            const delay = textIndex * 1450 + letterIndex * 650 / (letterCount - 1)
            character.style.setProperty('--letter-delay', `${delay}ms`)
            word.append(character)
            letterIndex++
          }
          visual.append(word)
        })
      })
      text.replaceChildren(accessible, visual)
    })
  }

  // След из 1–3 лепестков. Каждый лепесток удаляется после падения.
  const counts = [1, 2, 3, 2]
  let countIndex = 0
  let count = 1
  let mouseX = 0
  let mouseY = 0
  let cursorX = 0
  let cursorY = 0
  let clientX = 0
  let clientY = 0
  let inside = false
  let frame
  let petalTimer
  let countTimer

  function petalPosition(y, angle, size) {
    return `translateY(${y}px) rotate(${angle}deg) scale(${size})`
  }

  function createPetal(offset) {
    const petal = document.createElement('span')
    petal.className = 'cursor-falling-petal'
    petal.setAttribute('aria-hidden', 'true')
    petal.style.left = `${cursorX + offset - 14}px`
    petal.style.top = `${cursorY - 22 + Math.random() * 8}px`
    panel.append(petal)

    // У каждого лепестка свой начальный угол, поворот, путь и размер.
    const angle = Math.random() * 360
    const direction = Math.random() < .5 ? -1 : 1
    const turn = direction * (140 + Math.random() * 100)
    const distance = 75 + Math.random() * 20
    const size = .8 + Math.random() * .4
    const animation = petal.animate([
      { transform: petalPosition(0, angle, size * .9), opacity: 0 },
      { transform: petalPosition(distance * .14, angle + turn * .14, size), opacity: .65, offset: .14 },
      { transform: petalPosition(distance, angle + turn, size * .9), opacity: 0 }
    ], { duration: 2800 + Math.random() * 700, easing: 'linear' })
    animation.onfinish = () => petal.remove()
  }

  function dropPetals() {
    for (let i = 0; i < count; i++) {
      const offset = (i - (count - 1) / 2) * 20
      createPetal(offset)
    }
  }

  function updateMouse() {
    const rect = panel.getBoundingClientRect()
    mouseX = clientX - rect.left
    mouseY = clientY - rect.top
  }

  function followMouse() {
    cursorX += (mouseX - cursorX) * .1
    cursorY += (mouseY - cursorY) * .1
    frame = requestAnimationFrame(followMouse)
  }

  function changeCount() {
    count = counts[countIndex]
    countIndex = (countIndex + 1) % counts.length
  }

  function stopPetals(event) {
    inside = false
    clearInterval(petalTimer)
    clearInterval(countTimer)
    cancelAnimationFrame(frame)
    if (event.type !== 'pointerleave') {
      panel.querySelectorAll('.cursor-falling-petal').forEach((petal) => petal.remove())
    }
  }

  panel.addEventListener('pointerenter', (event) => {
    if (!mouseDevice.matches || reducedMotion.matches) return
    clientX = event.clientX
    clientY = event.clientY
    updateMouse()
    cursorX = mouseX
    cursorY = mouseY
    inside = true
    changeCount()
    dropPetals()
    frame = requestAnimationFrame(followMouse)
    petalTimer = setInterval(dropPetals, 150)
    countTimer = setInterval(changeCount, 700)
  })
  panel.addEventListener('pointermove', (event) => {
    clientX = event.clientX
    clientY = event.clientY
    updateMouse()
  }, { passive: true })
  panel.addEventListener('pointerleave', stopPetals)
  panel.addEventListener('pointercancel', stopPetals)
  window.addEventListener('blur', stopPetals)
  window.addEventListener('scroll', () => {
    if (inside) updateMouse()
  }, { passive: true })
  mouseDevice.addEventListener('change', stopPetals)
  reducedMotion.addEventListener('change', stopPetals)

  // Розовая заливка расходится кругом от кнопки.
  const circle = document.createElement('span')
  circle.className = 'launch-colour-circle'
  circle.setAttribute('aria-hidden', 'true')
  panel.append(circle)
  let clicked = false

  function positionCircle() {
    const card = panel.getBoundingClientRect()
    const rect = button.getBoundingClientRect()
    const x = rect.left + rect.width / 2 - card.left
    const y = rect.top + rect.height / 2 - card.top
    const radius = Math.hypot(Math.max(x, card.width - x), Math.max(y, card.height - y)) + 2
    circle.style.left = `${x}px`
    circle.style.top = `${y}px`
    circle.style.width = `${radius * 2}px`
    circle.style.height = `${radius * 2}px`
  }

  function expandCircle() {
    if (clicked || button.disabled) return
    positionCircle()
    panel.classList.add('is-launch-filled')
  }

  function collapseCircle() {
    panel.classList.remove('is-launch-filled')
  }

  function resetCircle() {
    clicked = false
    collapseCircle()
  }

  button.addEventListener('pointerenter', () => {
    if (mouseDevice.matches) expandCircle()
  })
  button.addEventListener('focus', () => {
    if (button.matches(':focus-visible')) expandCircle()
  })
  button.addEventListener('pointerleave', resetCircle)
  button.addEventListener('blur', resetCircle)
  button.addEventListener('pointercancel', resetCircle)
  button.addEventListener('click', () => {
    clicked = true
    collapseCircle()
  })
  button.form.addEventListener('submit', collapseCircle)
  window.addEventListener('blur', collapseCircle)
  window.addEventListener('resize', () => {
    if (panel.classList.contains('is-launch-filled')) positionCircle()
  })
})()
