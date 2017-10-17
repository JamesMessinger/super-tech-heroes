'use strict';

const util = require('../util');
const Response = require('../Response');
const characterStore = require('../characterStore');
const sampleCharacters = require('../samples/characters.json');

module.exports = findCharacters;

/**
 * Finds all characters, possibly filtered by query criteria.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function findCharacters (request) {
  return new Promise((resolve, reject) => {
    let user = util.findHeader(request.headers, 'X-API-Key');

    request.queryStringParameters = request.queryStringParameters || {};
    let name = request.queryStringParameters.name;
    let type = request.queryStringParameters.type;
    let power = request.queryStringParameters.power;

    characterStore.find(user, { name, type, power })
      .then(characters => {
        if (characters.length === 0 && user === 'DEMO' && !name && !type && !power) {
          // This is the DEMO account, so create sample characters rather than returning an empty response
          return Promise.all(sampleCharacters.map(character => characterStore.create(user, character)));
        }
        else {
          return characters;
        }
      })
      .then(characters => {
        // Sort the characters by name
        characters.sort((a, b) => a.name > b.name ? 1 : -1);

        // Convert the character models to REST resources
        let characterResources = characters.map(character => character.toResource(request));

        // Return an HTTP 200 OK response
        let response = Response.ok(characterResources);
        resolve(response);
      })
      .catch(reject);
  });
}
