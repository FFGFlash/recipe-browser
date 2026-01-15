import styles from './recipe-card.module.css' with { type: 'css' }

const template = document.createElement('template')
template.innerHTML = `
<div class="card">
  <slot name="image"></slot>

  <div class="content">
    <h2><slot name="name"></slot></h2>

    <div class="description"><slot name="description"></slot></div>

    <div class="meta">
      <div>
        <span class="label">Servings</span>
        <slot name="servings"></slot>
      </div>
      <div>
        <span class="label">Prep</span>
        <slot name="prep-time"></slot>
      </div>
      <div>
        <span class="label">Cook</span>
        <slot name="cook-time"></slot>
      </div>
    </div>

    <button id="view-btn">View Recipe</button>
  </div>
</div>

<dialog id="recipe-dialog" closedby="any">
  <div class="ingredients">
    <strong>Ingredients:</strong>
    <ul><slot name="ingredients"></slot></ul>
  </div>
  <div class="instructions">
    <strong>Instructions:</strong>
    <ol><slot name="instructions"></slot></ol>
  </div>
  <button class="close-btn" id="close-btn">Close</button>
</dialog>
`

export class RecipeCardElement extends HTMLElement {
  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })
    shadow.adoptedStyleSheets = [styles]
    shadow.append(template.content.cloneNode(true))
  }

  connectedCallback() {
    /** @type {HTMLDialogElement} */
    const dialog = this.shadowRoot.getElementById('recipe-dialog')
    const openBtn = this.shadowRoot.getElementById('view-btn')
    const closeBtn = this.shadowRoot.getElementById('close-btn')
    const card = this.shadowRoot.querySelector('.card')

    const openModal = () => {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    }
    const closeModal = () => {
      dialog.close()
    }
    const handleClose = () => {
      document.body.style.overflow = ''
    }

    openBtn.addEventListener('click', openModal)
    card.addEventListener('click', openModal)
    closeBtn.addEventListener('click', closeModal)
    dialog.addEventListener('close', handleClose)
  }
}

customElements.define('recipe-card', RecipeCardElement)
