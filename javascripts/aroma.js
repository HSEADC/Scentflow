(() => {
  const tabs = document.querySelectorAll('.aroma-tabs [role="tab"]')

  function selectTab(index) {
    tabs.forEach((tab, number) => {
      const selected = number === index
      tab.setAttribute('aria-selected', selected)
      tab.tabIndex = selected ? 0 : -1
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected
    })
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
})()
