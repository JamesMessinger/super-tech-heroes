'use strict';

const util = require('../util');
const Response = require('../Response');
const characterStore = require('../characterStore');
const demoData = require('../demo-data.json');

module.exports = findCharacters;

/**
 * Finds all characters, possibly filtered by query criteria.
 *
 * @param {object} args.request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function findCharacters ({ request }) {
  let user, name, type;

  return Promise.resolve()
    .then(() => {
      user = util.findHeader(request.headers, 'X-API-Key');
      ({ name, type } = (request.queryStringParameters || {}));

      return characterStore.find({ user, name, type });
    })
    .then(characters => {
      if (characters.length === 0 && user === 'DEMO' && !name && !type) {
        // The request is from the DEMO user, so create demo data rather than returning an empty response
        return createDemoData();
      }
      else {
        return characters;
      }
    })
    .then(characters => {
      // Find any related characters (e.g. sidekick, nemesis)
      return characterStore.populateRelations({ user, characters });
    })
    .then(characters => {
      // Sort the characters by name
      characters.sort((a, b) => a.name > b.name ? 1 : -1);

      // Convert the character models to REST resources
      let characterResources = characters.map(character => character.toResource(request));

      // Return an HTTP 200 OK response
      return Response.ok(characterResources);
    });
}

/**
 * Creates demo data for the DEMO user account, rather than returning an empty result.
 *
 * @returns {Promise<Character[]>} - Resolves with an array of the newly-created characters
 */
function createDemoData () {
  let user = 'DEMO';

  return Promise.all(demoData.map(hierarchy => characterStore.createHierarchy({ user, hierarchy })))
    .then(topLevelCharacters => {
      // Flatten the top-level characters, sidekicks, and nemesis all into a single-dimension array
      return topLevelCharacters.reduce((allCharacters, topLevelCharacter) => {
        // Add the top-level character to the array
        allCharacters.push(topLevelCharacter);

        // Add the sidekick to the array
        if (topLevelCharacter.sidekick) {
          allCharacters.push(topLevelCharacter.sidekick);
        }

        // Add the nemesis to the array
        if (topLevelCharacter.nemesis) {
          allCharacters.push(topLevelCharacter.nemesis);
        }

        return allCharacters;
      }, []);
    });
}
