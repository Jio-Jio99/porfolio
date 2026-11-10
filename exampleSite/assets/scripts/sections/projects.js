// Sovrascrive scripts/sections/projects.js del tema.
// Niente Filterizr: le card stanno in una CSS grid (vedi override.scss) e il filtro
// si limita a nascondere/mostrare le card, così altezze e spazi li gestisce il browser.
import { insertScript } from '../core'

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.filtr-projects').forEach((container) => {
    const sectionId = container.getAttribute('data-section')
    const items = Array.from(container.querySelectorAll('.filtr-item'))
    if (items.length === 0) return

    const buttons = Array.from(document.querySelectorAll(`.project-filtr-control[data-section="${sectionId}"]`))

    const categories = (item) =>
      (item.getAttribute('data-category') || '').split(',').map((c) => c.trim()).filter(Boolean)

    const applyFilter = (filter) => {
      buttons.forEach((b) => b.classList.toggle('active', b.getAttribute('data-filter') === filter))
      items.forEach((item) => {
        const show = filter === 'all' || categories(item).includes(filter)
        item.classList.toggle('is-hidden', !show)
      })
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => applyFilter(btn.getAttribute('data-filter') || 'all'))
    })
    applyFilter('all')
  })
})

insertScript('github-buttons', 'https://buttons.github.io/buttons.js')
