'use strict';

const util = require('../util');
const Response = require('../Response');
const characterStore = require('../characterStore');
const demoData = require('../demo-data.json');

module.exports = findCharacters;

/**
 * Finds all characters, possibly filtered by query criteria.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function findCharacters (request) {
  let isDemoRequest = false;

  return Promise.resolve()
    .then(() => {
      let user = util.findHeader(request.headers, 'X-API-Key');
      let { name, type, power } = (request.queryStringParameters || {});

      // If the request is from the DEMO user, and there isn't any filter critera,
      // then we'll return demo data rather than an empty result
      isDemoRequest = user === 'DEMO' && !name && !type && !power;

      return characterStore.find(user, { name, type, power });
    })
    .then(characters => {
      if (characters.length === 0 && isDemoRequest) {
        return createDemoCharacters();
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
      return Response.ok(characterResources);
    });
}

function createDemoCharacters () {
  // for (let character of demoData.characters) {

  // }

  // // This is the DEMO account, so create sample characters rather than returning an empty response
  // return Promise.all(sampleCharacters.map(character => characterStore.create(user, character)));
}
