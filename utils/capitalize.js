/**
 * Capitalizes the first letter of the given text
 * @param {string} text The text to capitalize
 * @returns The capitalized text
 */
export function capitalize(text) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`
}
