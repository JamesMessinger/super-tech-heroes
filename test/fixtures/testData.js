'use strict';

const _ = require('lodash');
const characterStore = require('../../lib/characterStore');
const sampleRequest = require('./api-gateway/request.json');

module.exports = {
  /**
   * Creates multiple new test records, and updates the source objects
   * with any new or changed fields (such as auto-assigned IDs)
   *
   * @param {string} user - The current user's ID
   * @param {Character[]} characters - The characters to create
   * @returns {Promise<Character[]>} - Resolves with the updated source objects
   */
  create (user, characters) {
    return Promise.all(characters.map(hierarchy => {
      return characterStore.createHierarchy({ user, hierarchy })
        .then(updatedCharacter => {
          let request = _.cloneDeep(sampleRequest);
          request.headers.Host = 'localhost';

          Object.assign(hierarchy, updatedCharacter.toResource(request));
        });
    }));
  },
};
