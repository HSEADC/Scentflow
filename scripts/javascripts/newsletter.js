(() => {
  const form = document.querySelector('.newsletter-form')
  const email = form.querySelector('[name="email"]')
  const button = form.querySelector('[type="submit"]')
  const status = form.querySelector('.form-status')
  const error = form.querySelector('[data-fs-error="email"]')
  const field = form.querySelector('.email-field')
  const buttonText = button.textContent

  // Отключаем стандартную подсказку браузера и показываем свою.
  form.noValidate = true
  error.id = `${email.id}-error`
  email.setAttribute('aria-describedby', error.id)
  field.append(error)

  function alignError() {
    const left = email.getBoundingClientRect().left - field.getBoundingClientRect().left
    error.style.setProperty('--error-inset', `${left}px`)
  }

  function showError(message) {
    alignError()
    error.textContent = message
    email.setAttribute('aria-invalid', 'true')
    email.focus()
  }

  window.addEventListener('resize', alignError)
  email.addEventListener('input', () => {
    error.textContent = ''
    status.textContent = ''
    email.removeAttribute('aria-invalid')
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (button.disabled || form.classList.contains('is-success')) return
    if (!email.validity.valid) {
      showError(email.value ? 'Введите email в формате name@example.com.' : 'Введите ваш email.')
      return
    }

    button.disabled = true
    button.textContent = 'Отправляем…'
    form.setAttribute('aria-busy', 'true')
    error.textContent = ''
    status.textContent = ''
    email.removeAttribute('aria-invalid')
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        signal: controller.signal
      })
      if (!response.ok) throw new Error('Не удалось отправить форму')
      form.reset()
      form.classList.add('is-success')
      status.textContent = form.dataset.successMessage || 'Спасибо! Заявка на подписку отправлена.'
    } catch {
      status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз чуть позже.'
    } finally {
      clearTimeout(timeout)
      button.disabled = false
      button.textContent = buttonText
      form.removeAttribute('aria-busy')
    }
  })
})()
