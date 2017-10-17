'use strict';

const AWS = require('aws-sdk');
const Character = require('./Character');
const Response = require('./Response');
const validate = require('./validate');
const util = require('./util');
const uuid = require('uuid');

const TableName = process.env.SUPER_TECH_HEROES_TABLE_NAME;
const ttlHours = parseInt(process.env.SUPER_TECH_HEROES_TTL_HOURS) || 4;

// DynamoDB client API
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN,
  region: process.env.AWS_REGION,
});

const characterStore = module.exports = {
  /**
   * Creates a new character with a new ID.
   *
   * @param {string} user - The current user's ID
   * @param {Character} character - The character to create
   * @returns {Promise<Character>} - Resolves with the fully-populated character object
   */
  create (user, character) {
    character = new Character(character);
    character.id = uuid.v4().replace(/-/g, '');
    return characterStore.update(user, character);
  },

  /**
   * Creates a top-level character and its sidekick and/or nemesis.
   *
   * @param {string} user - The current user's ID
   * @param {object} hierarchy - The top-level character and its sidekick and/or nemesis
   * @returns {Promise<Character>} - Resolves with a {@link Character} object, including its sidekick and/or nemesis
   */
  createHierarchy (user, hierarchy) {
    return Promise.resolve()
      .then(() => Character.fromHierarchy(hierarchy))
      .then(character => {
        // If the sidekick/nemesis already exists, then fetch them; otherwise, create them
        return Promise.all([
          character,
          character.sidekick && characterStore.findOrCreate(user, character.sidekick),
          character.nemesis && characterStore.findOrCreate(user, character.nemesis),
        ]);
      })
      .then(([character, sidekick, nemesis]) => {
        // Set the sidekick/nemesis to the existing or newly-created Characters
        character.sidekick = sidekick;
        character.nemesis = nemesis;

        // Create the main character
        return characterStore.create(user, character);
      });
  },

  /**
   * Updates an existing character by its ID.
   *
   * @param {string} user - The current user's ID
   * @param {Character} character - The character to update
   * @returns {Promise<Character>} - Resolves with the fully-populated character object
   */
  update (user, character) {
    return Promise.resolve()
      .then(() => {
        character = new Character(character);

        // Add metadata
        character.user = user;
        character.normalizedName = normalizeName(character.name);
        character.expires = getExpiryTime();

        // Validate the character before making any DB calls
        character.validate({ model: true });

        // Make sure there's not another character with the same name
        return ensureCharacterIsUnique(user, character);
      })
      .then(() => {
        // Convert the character to a database model
        let Item = character.toModel();

        // Save it to the DB
        return util.promisify(dynamoDB, 'put', { TableName, Item });
      })
      .then(() => character);
  },

  /**
   * Deletes an existing character by its ID.
   *
   * @param {string} user - The current user's ID
   * @param {string} id - The ID of the character to delete
   * @returns {Promise} - Resolves without a return value
   */
  delete (user, id) {
    validate.guid('id', id);

    return Promise.reject(new Error('Not yet implemented'));
  },

  /**
   * Returns the specified character by id or normalizedName, or creates a new character.
   *
   * @param {string} user - The current user's ID
   * @param {Character} character - The character to find or create
   * @returns {Promise<Character>} - Resolves with the existing or newly-created character
   */
  findOrCreate (user, character) {
    if (character.id || character.normalizedName) {
      return characterStore.findOne(user, character);
    }
    else {
      return characterStore.create(user, character);
    }
  },

  /**
   * Finds a specific character by its id or normalizedName.
   * Throws an error if the character does not exist.
   *
   * @param {string} user - The current user's ID
   * @param {string} [character.id] - The ID of the character to find
   * @param {string} [character.normalizedName] - The normalized name of the character to find
   * @returns {Promise<Character>} - Resolves with the existing or newly-created character
   */
  findOne (user, { id, normalizedName }) {
    return Promise.resolve()
      .then(() => {
        let query = {
          TableName,
          FilterExpression: '#user = :user and #field = :value',
          ExpressionAttributeNames: {
            '#user': 'user',
            '#field': id ? 'id' : 'normalizedName',
          },
          ExpressionAttributeValues: {
            ':user': user,
            ':value': id || normalizedName,
          },
        };

        return util.promisify(dynamoDB, 'scan', query);
      })
      .then(results => {
        if (results.Items.length === 0) {
          throw Response.resourceNotFound(`Character "${id || normalizedName}" does not exist`);
        }
        else {
          let character = new Character(results.Items[0]);
          return character;
        }
      });
  },

  /**
   * Finds all characters that match the specified search criteria.
   *
   * @param {string} user - The current user's ID
   * @param {object} criteria - The search criteria
   * @param {string} [criteria.name] - The character name to search for
   * @param {string} [criteria.type] - The type of characters to search for
   * @returns {Promise<Character[]>} - Resolves with an array of character objects
   */
  find (user, { name, type }) {
    return Promise.resolve()
      .then(() => {
        // By default, find all characters for this user
        let query = {
          TableName,
          FilterExpression: '#user = :user',
          ExpressionAttributeNames: {
            '#user': 'user'
          },
          ExpressionAttributeValues: {
            ':user': user,
          },
        };

        if (name) {
          validate.nonEmptyString('name', name);
          query.FilterExpression += ' and contains(#normalizedName, :normalizedName)';
          query.ExpressionAttributeNames['#normalizedName'] = 'normalizedName';
          query.ExpressionAttributeValues[':normalizedName'] = normalizeName(name);
        }

        if (type) {
          validate.oneOf('type', type, ['hero', 'sidekick', 'villain']);
          query.FilterExpression += ' and #type = :type';
          query.ExpressionAttributeNames['#type'] = 'type';
          query.ExpressionAttributeValues[':type'] = type;
        }

        return util.promisify(dynamoDB, 'scan', query);
      })
      .then(results => {
        let characters = results.Items.map(item => new Character(item));
        return characters;
      });
  },

  /**
   * Populates the "sidekick" and "nemesis" properties of all the given characters,
   * fetching them from the database if necessary.
   *
   * @param {string} user - The current user's ID
   * @param {Character[]} characters - The characters to populate
   * @param {Promise<Character[]>} - The fully-populated characters
   */
  populateRelations (user, characters) {
    return Promise.resolve()
      .then(() => {
        let charactersWeNeed = [];

        for (let character of characters) {
          for (let relation of ['sidekick', 'nemesis']) {
            if (character[relation] && !character[relation].normalizedName) {
              // Find the related character in the list, if possible
              let found = characters.find(other => other.id === character[relation].id);

              if (found) {
                // We found the related character in the list, so no need to query the DB for it
                character[relation] = found;
              }
              else {
                // We couldn't find the related character in the list, so we'll have to query the DB for it
                charactersWeNeed.push({ id: character[relation].id });
              }
            }
          }
        }

        if (charactersWeNeed.length > 0) {
          let query = {
            RequestItems: {
              [TableName]: {
                Keys: charactersWeNeed,
              }
            }
          };

          return util.promisify(dynamoDB, 'batchGet', query);
        }
      })
      .then(results => {
        if (results) {
          for (let character of results.Items) {

          }
        }
      })
      .then(() => {
        return characters;
      });
  }

};

/**
 * Normalizes a character name for comparison and search purposes.
 * (e.g. "Dr. Octocat" => "droctocat")
 *
 * @param {string} name - The non-normalized character name
 * @returns {string} - The normalized character name
 */
function normalizeName (name) {
  let normalized = name.trim().toLowerCase().replace(/[^a-z0-9]/ig, '');
  return normalized;
}

/**
 * Becuase the Super Tech Heroes API is intended for demo purposes, it automatically "resets" periodically.
 * Each item in the SuperTechHeroes.Characters table has a TTL, after which the items are automatically deleted.
 * This function calculates the expiration date/time, based on the configured TTL.
 *
 * @returns {number} - The Unix Epoch time at which data expires
 */
function getExpiryTime () {
  let ttlMilliseconds = 1000 * 60 * 60 * ttlHours;
  let now = new Date();
  let expires = now.setUTCMilliseconds(ttlMilliseconds);

  // Return the TTL in seconds, not milliseconds
  return expires / 1000;
}

/**
 * Throws an error if there is another character with the same name.
 *
 * @param {string} user - The current user's ID
 * @param {Character} character - The character to check
 * @returns {Promise}
 */
function ensureCharacterIsUnique (user, character) {
  // Search for a character with the same name
  return characterStore.findOne(user, { normalizedName: character.normalizedName })
    .then(existingCharacter => {
      // An existing character was found, but it could be the same character.
      if (existingCharacter.id !== character.id) {
        // Are the names exactly the same?
        if (existingCharacter.name.trim().toLowerCase() === character.name.trim().toLowerCase()) {
          throw Response.conflict(`There is already another character named ${character.name}`);
        }
        else {
          throw Response.conflict(
            `"${character.name}" is too similar to another character's name (${existingCharacter.name})`
          );
        }
      }
    })
    .catch(error => {
      if (error.statusCode === 404) {
        // No existing character with the same name was found, which is ok
      }
      else {
        throw error;
      }
    });
}
