'use strict';

const Response = require('../Response');

module.exports = deleteCharacter;

/**
 * Deletes a character
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function deleteCharacter () {
  return new Promise((resolve) => {
    let id = '12345abcdef';

    resolve(Response.ok({
      id,
      message: `Successfully deleted character: "${id}"`,
    }));
  });
}
