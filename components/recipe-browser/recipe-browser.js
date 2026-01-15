import { capitalize } from '../../utils/capitalize.js'
import { debounce } from '../../utils/debounce.js'
import { readSlot } from '../../utils/read-slot.js'
import { RecipeCardElement } from '../recipe-card/recipe-card.js'
import styles from './recipe-browser.module.css' with { type: 'css' }

const template = document.createElement('template')
template.innerHTML = `
<div class="filters">
  <input type="search" placeholder="Search..." id="search">

  <label class="sliders">
    Servings:
    <input type="range" id="servings" min="0" value="0">
    <span id="servings-value">0</span>
  </label>

  <label class="sliders">
    Max Prep:
    <input type="range" id="prep" min="0" step="5">
    <span id="prep-value">0</span>
  </label>

  <label class="sliders">
    Max Cook:
    <input type="range" id="cook" min="0" step="5">
    <span id="cook-value">0</span>
  </label>

  <select id="tags" multiple>
    <option value="" selected>Any tag</option>
  </select>
</div>

<div class="grid">
  <slot></slot>
</div>
`

class RecipeBrowserElement extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [styles]
    shadow.append(template.content.cloneNode(true))
  }

  connectedCallback() {
    /** @type {RecipeCardElement[]} */
    const cards = [...this.querySelectorAll('recipe-card')]

    /** @type {import('../../utils/read-slot').Transformer<number>} */
    const parseMinutes = text => Number(text.match(/\d+/)?.[0] ?? '0') || 0

    // Read all the slot information for each recipe
    const data = cards.map(card => ({
      element: card,
      name: readSlot(card, 'name'),
      description: readSlot(card, 'description'),
      tags: readSlot(card, 'tags', text => text.split(',').map(t => t.trim())),
      prepTime: readSlot(card, 'prep-time', parseMinutes),
      cookTime: readSlot(card, 'cook-time', parseMinutes),
      servings: readSlot(card, 'servings', Number),
    }))

    /** @type {Set<string>} */
    const tagsSet = new Set()

    // Calculate the upper bounds of each slider and get all the tags
    const { maxPrep, maxCook, maxServings } = data.reduce(
      ({ maxPrep, maxCook, maxServings }, item) => {
        item.tags.forEach(tag => tagsSet.add(tag))
        return {
          maxPrep: Math.max(maxPrep, item.prepTime),
          maxCook: Math.max(maxCook, item.cookTime),
          maxServings: Math.max(maxServings, item.servings),
        }
      },
      { maxPrep: 0, maxCook: 0, maxServings: 0 },
    )

    /** @type {HTMLInputElement} */
    const searchInput = this.shadowRoot.getElementById('search')
    /** @type {HTMLInputElement} */
    const servingsSlider = this.shadowRoot.getElementById('servings')
    /** @type {HTMLInputElement} */
    const prepSlider = this.shadowRoot.getElementById('prep')
    /** @type {HTMLInputElement} */
    const cookSlider = this.shadowRoot.getElementById('cook')
    /** @type {HTMLSelectElement} */
    const tagFilter = this.shadowRoot.getElementById('tags')

    const servingsValue = this.shadowRoot.getElementById('servings-value')
    const prepValue = this.shadowRoot.getElementById('prep-value')
    const cookValue = this.shadowRoot.getElementById('cook-value')

    // Update the sliders with the proper max bounds
    servingsSlider.max = maxServings
    prepSlider.max = Math.ceil(maxPrep / 5) * 5
    prepSlider.value = prepSlider.max
    cookSlider.max = Math.ceil(maxCook / 5) * 5
    cookSlider.value = cookSlider.max

    // Update the slider value displays to match the values
    prepValue.textContent = prepSlider.value
    cookValue.textContent = cookSlider.value

    // Update the tagFilter with all the available tags
    const tagOptions = [...tagsSet].sort().map(tag => {
      const opt = document.createElement('option')
      opt.value = tag
      opt.textContent = capitalize(tag)
      return opt
    })
    tagFilter.append(...tagOptions)

    /**
     * @param {string} query
     * @param {number} minServings
     * @param {number} maxPrepTime
     * @param {number} maxCookTime
     * @param {string[]} selectedTags
     */
    const applyFilters = (query, minServings, maxPrepTime, maxCookTime, selectedTags) => {
      for (const item of data) {
        const matchesSearch = item.name.includes(query) || item.description.includes(query)
        const matchesServings = item.servings >= minServings
        const matchesPrep = item.prepTime <= maxPrepTime
        const matchesCook = item.cookTime <= maxCookTime
        const matchesTags =
          selectedTags.length === 0 || selectedTags.every(t => item.tags.includes(t))

        item.element.hidden = !(
          matchesSearch &&
          matchesServings &&
          matchesPrep &&
          matchesCook &&
          matchesTags
        )
      }
    }

    const applyFiltersDebounced = debounce(applyFilters)

    const updateValues = (force = false) => {
      const query = searchInput.value.toLowerCase()
      const minServings = Number(servingsSlider.value)
      const maxPrepTime = Number(prepSlider.value)
      const maxCookTime = Number(cookSlider.value)
      const selectedTags = Array.from(tagFilter.selectedOptions)
        .map(o => o.value)
        .filter(Boolean)

      servingsValue.textContent = minServings
      prepValue.textContent = maxPrepTime
      cookValue.textContent = maxCookTime

      if (!force)
        return applyFiltersDebounced(query, minServings, maxPrepTime, maxCookTime, selectedTags)
      return applyFilters(query, minServings, maxPrepTime, maxCookTime, selectedTags)
    }

    searchInput.addEventListener('input', () => updateValues())
    servingsSlider.addEventListener('input', () => updateValues())
    prepSlider.addEventListener('input', () => updateValues())
    cookSlider.addEventListener('input', () => updateValues())
    tagFilter.addEventListener('change', () => updateValues())

    updateValues(true)
  }
}

customElements.define('recipe-browser', RecipeBrowserElement)
