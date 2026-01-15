/**
 * Creates a debounced version of the provided function.
 *
 * @template {Array<any>} TArgs
 * @param {(...args: TArgs) => void} fn The function to debounce
 * @param {number} [delay] The delay in milliseconds
 * @returns {(...args: TArgs) => void} The debounced function
 */
export function debounce(fn, delay = 150) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(fn, delay, ...args)
  }
}
