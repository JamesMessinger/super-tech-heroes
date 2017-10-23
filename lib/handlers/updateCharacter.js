'use strict';

const Response = require('../Response');

module.exports = updateCharacter;

/**
 * Updates a character
 *
 * @param {object} args.request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function updateCharacter () {
  return Promise.resolve()
    .then(() => {
      return Response.methodNotAllowed('This endpoint is not yet implemented');
    });
}
