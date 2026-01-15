/**
 * Reads the textContent of the given slot element.
 *
 * If a transform callback is provided, the return value will be that of the transform.
 *
 * @template [T=string]
 * @param {HTMLElement} el The parent element containing the slot element
 * @param {string} slotName The name of the slot element
 * @param {Transformer<T>} [transform] A function to transform the text value
 * @returns {T}
 */
export function readSlot(el, slotName, transform) {
  const raw = el.querySelector(`[slot="${slotName}"]`)?.textContent.trim().toLowerCase() ?? ''
  return transform?.(raw) ?? raw
}

/**
 * @template T
 * @callback Transformer
 * @param {string} text
 * @returns {T}
 */
