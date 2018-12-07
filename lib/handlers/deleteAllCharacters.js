"use strict";

const util = require("../util");
const characterStore = require("../characterStore");
const Response = require("../Response");

module.exports = deleteAllCharacters;

/**
 * Deletes all characters that were created by the current user
 *
 * @param {object} args.request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function deleteAllCharacters ({ request }) {
  return Promise.resolve()
    .then(() => {
      let user = util.findHeader(request.headers, "X-API-Key");

      return characterStore.deleteAll({ user });
    })
    .then(count => {
      return Response.ok({
        count,
        message: `${count} characters were deleted`,
      });
    });
}
