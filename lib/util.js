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
   * Returns the server's hostname (e.g. "https://api.heroes.jamesmessinger.com")
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

  /**
   * Wraps a Node-style callback function in ES6 promises.
   *
   * @param {object} [context] - The `this` context for the function
   * @param {string|function} fn - The function to call, or the name of a method on the `context` object
   * @returns {function} - Returns a function that calls the original function and returns a Promise
   */
  promisify (context, fn) {
    // Shift arguments if `context` is omitted
    if (typeof context === 'function') {
      fn = context;
      context = null;
    }
    else if (typeof fn === 'string') {
      fn = context[fn];
    }

    return function (...args) {
      return new Promise((resolve, reject) => {
        // Add a callback function that resolves/rejects the promise
        args.push((err, ...results) => {
          if (err) {
            reject(err);
          }
          else if (results.length <= 1) {
            // Resolve with a single value
            resolve(results[0]);
          }
          else {
            // Resolve with an array of values
            resolve(results);
          }
        });

        // Call the function asynchronously
        fn.apply(context, args);
      });
    };
  },

};
