'use strict';

const util = require('../util');
const characterStore = require('../characterStore');
const Response = require('../Response');
const validate = require('../validate');

module.exports = createCharacter;

/**
 * Creates a new character. If the character is a hero, then its sidekick and nemesis can be
 * created at the same time.
 *
 * @param {object} args.request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function createCharacter ({ request }) {
  return Promise.resolve()
    .then(() => {
      let user = util.findHeader(request.headers, 'X-API-Key');
      let hierarchy = validate.characterPOJO('body', request.body);

      return characterStore.createHierarchy({ user, hierarchy });
    })
    .then(newCharacter => {
      // Convert the character to a REST resource
      newCharacter = newCharacter.toResource(request);

      // Return an HTTP 201 (Created) response
      let response = Response.created(newCharacter, {
        Location: newCharacter.links.self,
      });

      return response;
    });
}
