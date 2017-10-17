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
  return Promise.resolve()
    .then(() => {
      let id = '12345abcdef';

      return Response.ok({
        id,
      });
    });
}
