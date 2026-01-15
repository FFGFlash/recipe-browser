/**
 * @template [T=string]
 * @param {HTMLElement} el
 * @param {string} slotName
 * @param {Transformer<T>} [transform]
 * @returns {T}
 */
export function readSlot(el, slotName, transform) {
  const raw = el.querySelector(`[slot="${slotName}"]`)?.textContent.trim().toLowerCase() ?? ""
  return transform?.(raw) ?? raw
}

/**
 * @template T
 * @callback Transformer
 * @param {string} text
 * @returns {T}
 */
