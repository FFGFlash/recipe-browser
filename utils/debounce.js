/**
 * @template {Array<any>} TArgs
 * @param {(...args: TArgs) => void} fn
 * @param {number} [delay]
 * @returns {(...args: TArgs) => void}
 */
export function debounce(fn, delay = 150) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(fn, delay, ...args)
  }
}
