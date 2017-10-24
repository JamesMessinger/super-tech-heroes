'use strict';

const util = require('../util');
const Character = require('../Character');
const characterStore = require('../characterStore');
const Response = require('../Response');
const validate = require('../validate');

module.exports = updateCharacter;

/**
 * Updates an existing character
 *
 * @param {object} args.request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function updateCharacter ({ request }) {
  let user, newCharacter;

  return Promise.resolve()
    .then(() => {
      user = util.findHeader(request.headers, 'X-API-Key');
      newCharacter = validate.characterPOJO('body', request.body);
      let normalizedName = request.pathParameters[0];

      // Convert the sidekick/nemesis URLs to Character objects
      if (newCharacter.sidekick) {
        newCharacter.sidekick = Character.fromUrl({ url: newCharacter.sidekick, type: 'sidekick' });
      }
      if (newCharacter.nemesis) {
        newCharacter.nemesis = Character.fromUrl({ url: newCharacter.nemesis, type: 'nemesis' });
      }

      // Find the existing character and the new sidekick/nemesis
      return Promise.all([
        characterStore.findOne({ user, character: { normalizedName }}),
        newCharacter.sidekick && characterStore.findOne({ user, character: newCharacter.sidekick }),
        newCharacter.nemesis && characterStore.findOne({ user, character: newCharacter.nemesis }),
      ]);
    })
    .then(([existingCharacter, newSidekick, newNemesis]) => {
      // Set the character IDs
      newCharacter.id = existingCharacter.id;
      newCharacter.sidekick = newSidekick;
      newCharacter.nemesis = newNemesis;

      // Update the character
      return characterStore.update({ user, character: newCharacter });
    })
    .then(updatedCharacter => {
      // Convert the character to a REST resource
      updatedCharacter = updatedCharacter.toResource(request);

      // Return an HTTP 200 (OK) response
      let response = Response.ok(updatedCharacter, {
        Location: updatedCharacter.links.self,
      });

      return response;
    });
}
