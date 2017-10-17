'use strict';

const characterStore = require('../../lib/characterStore');
const sampleCharacters = require('../../lib/samples/characters.json');

module.exports = {
  /**
   * The sample characters for the "DEMO" account
   *
   * @type {object[]}
   */
  sampleCharacters,

  /**
   * Creates multiple new test records, and updates the source objects
   * with any new or changed fields (such as auto-assigned IDs)
   *
   * @param {string} user - The current user's ID
   * @param {Character[]} characters - The characters to create
   * @returns {Promise<Character[]>} - Resolves with the updated source objects
   */
  create (user, characters) {
    return Promise.all(characters.map(character => {
      return characterStore.create(user, character)
        .then(updatedCharacter => Object.assign(character, updatedCharacter.toResource()));
    }));
  },
};
