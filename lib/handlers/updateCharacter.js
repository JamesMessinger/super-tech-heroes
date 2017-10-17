'use strict';

const Response = require('../Response');

module.exports = updateCharacter;

/**
 * Updates a character
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function updateCharacter () {
  return new Promise((resolve) => {
    let id = '12345abcdef';

    resolve(Response.ok({
      id,
    }));
  });
}
