'use strict';

const _ = require('lodash');
const chai = require('chai');
const expect = chai.expect;
chai.should();

let assert = module.exports = {
  /**
   * Asserts that the given character is valid.
   *
   * @param {object} character - The character to validate
   * @returns {object} - Returns the character
   */
  isValidCharacter (character) {
    try {
      expect(character).to.be.an('object');
      character.should.have.keys('id', 'type', 'name', 'from', 'to', 'links');

      expect(character.id).to.be.a('string').and.match(/^[a-f0-9]{32}$/);
      expect(character.type).to.be.a('string').and.not.empty;
      expect(character.name).to.be.a('string').and.not.empty;

      expect(character.to).to.be.a('number').above(1600).and.below(3000);
      expect(character.from).to.be.a('number').above(1600).and.below(3000);
      character.from.should.be.at.most(character.to);

      expect(character.links).to.be.an('object');
      character.links.should.have.keys('self');
      expect(character.links.self).to.be.a('string');
      character.links.self.should.equal(`http://localhost/characters/${character.id}`);

      return character;
    }
    catch (error) {
      console.error(`\nCharacter: \n${JSON.stringify(character, null, 2)}\n`);
      throw error;
    }
  },

  /**
   * Asserts that the given response is well formed.
   *
   * @param {object} response - The HTTP response to validate
   * @param {number} statusCode - The expected status code
   * @returns {object} - Returns the parsed response body
   */
  isValidResponse (response, statusCode) {
    try {
      expect(response).to.be.an('object');
      response.should.have.keys('statusCode', 'headers', 'body');

      expect(response.statusCode).to.be.a('number');
      response.statusCode.should.equal(statusCode);
      response.statusCode.should.be.at.least(100).and.below(600);

      expect(response.headers).to.be.an('object');
      for (let key of Object.keys(response.headers)) {
        expect(key).to.be.a('string').and.match(/^[a-z]+(\-[a-z]+)*$/i);
        expect(response.headers[key]).to.be.a('string');
      }

      expect(response.body).to.be.a('string').and.not.empty;
      return JSON.parse(response.body);
    }
    catch (error) {
      console.error(`\nHTTP response: \n${JSON.stringify(response, null, 2)}\n`);
      throw error;
    }
  },

  /**
   * Asserts that the given response is well formed and is not an error.
   *
   * @param {object} response - The HTTP response to validate
   * @param {number} statusCode - The expected status code
   * @returns {object} - Returns the parsed response body
   */
  isSuccessfulResponse (response, statusCode) {
    let body = assert.isValidResponse(response, statusCode);
    response.statusCode.should.be.at.least(200).and.below(300);
    return body;
  },

  /**
   * Asserts that the given response is well formed and is an error.
   *
   * @param {object} response - The HTTP response to validate
   * @param {number} statusCode - The expected status code
   * @returns {object} - Returns the parsed response body
   */
  isErrorResponse (response, statusCode) {
    let body = assert.isValidResponse(response, statusCode);
    response.statusCode.should.be.at.least(400).and.below(600);

    body.should.be.an('object');
    body.should.have.keys('error', 'message');
    body.error.should.be.a('string').and.match(/^[A-Z]+(_[A-Z]+)*$/);
    body.message.should.be.a('string').and.not.empty;

    return body;
  },

  /**
   * Asserts that the given characters match the specified test data,
   * even if the test data does not contain all fields.
   *
   * @param {object|object[]} characters - One or more characters that were returned by the API
   * @param {object|object[]} testData - One or more character objects to compare
   */
  matchesTestData (characters, testData) {
    characters = Array.isArray(characters) ? characters : [characters];
    testData = Array.isArray(testData) ? testData : [testData];
    characters.should.have.lengthOf(testData.length);

    // Delete any fields from the characters that don't exist on the test data
    let charactersCopy = _.cloneDeep(characters);
    charactersCopy.forEach(character => {
      if (!testData[0].id) {
        delete character.id;
      }
      if (!testData[0].links) {
        delete character.links;
      }
    });

    // Everything else should match
    charactersCopy.should.have.same.deep.members(testData);
  },

};
