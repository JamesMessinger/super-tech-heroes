'use strict';

const util = require('../util');
const characterStore = require('../characterStore');
const Response = require('../Response');

module.exports = getCharacter;

/**
 * Returns a single character
 *
 * @param {object} args.request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function getCharacter ({ request }) {
  return Promise.resolve()
    .then(() => {
      let user = util.findHeader(request.headers, 'X-API-Key');
      let normalizedName = request.pathParameters[0];

      return characterStore.findOne({ user, character: { normalizedName }});
    })
    .then(character => {
      // Find any related characters (e.g. sidekick, nemesis)
      return characterStore.populateRelations({ characters: [character]});
    })
    .then(([character]) => {
      // Convert the character to a REST resource
      character = character.toResource(request);

      // Return an HTTP 200 (OK) response
      let response = Response.ok(character, {
        Location: character.links.self,
      });

      return response;
    });
}
