'use strict';

const util = require('../util');
const characterStore = require('../characterStore');
const Response = require('../Response');
const Character = require('../Character');

module.exports = createCharacter;

/**
 * Creates a new character. If the character is a hero, then its sidekick and nemesis can be
 * created at the same time.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function createCharacter (request) {
  return new Promise((resolve, reject) => {
    let user = util.findHeader(request.headers, 'X-API-Key');

    let character = parseRequestBody(request);

    Promise.all(
      [
        // If the sidekick/nemesis already exists, then fetch them; otherwise, create them
        character.sidekick && characterStore.findOrCreate(user, character.sidekick),
        character.nemesis && characterStore.findOrCreate(user, character.nemesis),
      ])
      .then(([sidekick, nemesis]) => {
        // Set the sidekick/nemesis to the existing or newly-created Characters
        character.sidekick = sidekick;
        character.nemesis = nemesis;

        // Create the main character
        return characterStore.create(user, character);
      })
      .then(newCharacter => {
        // Convert the character to a REST resource
        newCharacter = newCharacter.toResource(request);

        // Return an HTTP 201 (Created) response
        let response = Response.created(newCharacter, {
          Location: newCharacter.links.self,
        });

        resolve(response);
      })
      .catch(reject);
  });
}

/**
 * Parses the incoming HTTP request body and returns the data as {@link Character} object(s)
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Character}
 */
function parseRequestBody ({ body }) {
  if (body.type === 'sidekick') {
    // Only a sidekick was provided
    return new Character(body);
  }
  else if (body.type === 'villain') {
    // Only a villain was provided
    return new Character(body);
  }

  // A hero was provided, possibly along with a sidekick and/or a nemesis.
  // So start-off by separating the sidekick and nemesis data from the hero data
  let sidekick = body.sidekick;
  delete body.sidekick;

  let nemesis = body.nemesis;
  delete body.nemesis;

  // Create the hero, and assign the sidekick and nemesis (if any)
  let hero = new Character(body);
  hero.sidekick = Character.fromRelation(sidekick, 'sidekick');
  hero.nemesis = Character.fromRelation(nemesis, 'villain');

  return hero;
}
