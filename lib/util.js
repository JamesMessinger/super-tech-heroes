'use strict';

const util = module.exports = {
  /**
   * Returns the value of the specified HTTP header, case-insensitively.
   *
   * @param {object} headers - The HTTP headers to search
   * @param {string} name - The header to return
   * @returns {?string} - Returns the header value, if found
   */
  findHeader (headers, name) {
    name = name.toLowerCase();

    for (let key of Object.keys(headers)) {
      if (key.toLowerCase() === name) {
        return headers[key];
      }
    }

    return null; // not found
  },

  /**
   * Returns the server's hostname (e.g. "http://api.heroes.bigstickcarpet.com")
   *
   * @param {object} request - The incoming HTTP request
   * @returns {string}
   */
  getHostName (request) {
    let hostname = util.findHeader(request.headers, 'Host');
    if (!hostname) {
      // There's no Host header, so we can't determine the hostname.
      // Instead, we'll just have to use relative paths
      return '';
    }

    let protocol = util.findHeader(request.headers, 'X-Forwarded-Proto') ||
      util.findHeader(request.headers, 'CloudFront-Forwarded-Proto') ||
      'https';

    return `${protocol}://${hostname}`;
  },

};
