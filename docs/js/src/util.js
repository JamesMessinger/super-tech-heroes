/**
 * Returns the character with the specified URL.
 *
 * @param {object[]} characters - The array of characters to search
 * @param {string} url - The character URL to search for
 * @returns {object|undefined}
 */
export function findByUrl (characters, url) {
  return characters.find(char => char.links.self === url);
}

/**
 * Returns the slug part of a character's URL
 *
 * @param {string} url - The character's full URL (e.g. "https://api.heroes.jamesmessinger.com/characters/wonderwoman")
 * @returns {string} - The character's slug (e.g. "wonderwoman")
 */
export function getSlug (url) {
  return /\/characters\/(.+)$/.exec(url)[1];
}

/**
 * Returns the value of the specified querystring parameter, or a default value
 *
 * @param {string} name - The name of the querystring parameter
 * @param {string} defaultValue - The value to return if the query parameter is not set
 * @returns {string}
 */
export function getQueryParam (name, defaultValue) {
  let regex = new RegExp(`[?&]${name}=([^&]+)`, 'i');
  let match = regex.exec(location.search);

  if (match) {
    return match[1];
  }
  else {
    return defaultValue;
  }
}
