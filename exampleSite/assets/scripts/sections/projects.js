// Sovrascrive scripts/sections/projects.js del tema:
// stessa logica, in più tutte le card dei progetti prendono l'altezza della più alta.
import Filterizr from 'filterizr'
import { insertScript } from '../core'

function equalizeCards (holder) {
  const cards = Array.from(holder.querySelectorAll('.filtr-item > .card > .card'))
  cards.forEach((c) => { c.style.minHeight = '' })
  const max = Math.max(0, ...cards.map((c) => c.offsetHeight))
  cards.forEach((c) => { c.style.minHeight = `${max}px` })
}

document.addEventListener('DOMContentLoaded', () => {
  const projectContainers = document.querySelectorAll('.filtr-projects')
  projectContainers.forEach((container) => {
    const sectionId = container.getAttribute('data-section')
    const cardHolder = document.getElementById(`project-card-holder-${sectionId}`)
    if (cardHolder == null || cardHolder.children.length === 0) return

    const controlsSelector = `.project-filtr-control[data-section="${sectionId}"]`
    let activeFilter = 'all'
    document.querySelectorAll(controlsSelector).forEach((btn) => {
      btn.addEventListener('click', () => { activeFilter = btn.getAttribute('data-filter') || 'all' })
    })

    equalizeCards(cardHolder)
    const filterizr = new Filterizr(container, {
      layout: 'sameWidth',
      controlsSelector
    })

    let timer = null
    const relayout = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        equalizeCards(cardHolder)
        filterizr.filter(activeFilter)
      }, 150)
    }
    window.addEventListener('load', relayout)
    window.addEventListener('resize', relayout)
  })
})

insertScript('github-buttons', 'https://buttons.github.io/buttons.js')
