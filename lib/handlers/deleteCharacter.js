'use strict';

const Response = require('../Response');

module.exports = deleteCharacter;

/**
 * Deletes a character
 *
 * @param {object} params.request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function deleteCharacter () {
  return Promise.resolve()
    .then(() => {
      let id = '12345abcdef';

      return Response.ok({
        id,
        message: `Successfully deleted character: "${id}"`,
      });
    });
}
