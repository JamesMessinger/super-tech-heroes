'use strict';

const apiGateway = require('../fixtures/api-gateway/apiGateway');
const testData = require('../fixtures/testData');
const assert = require('../fixtures/assert');

describe('Find characters', () => {

  // Create a unique User ID for each test, so we know there aren't any existing characters
  let user;
  beforeEach(() => user = `${Date.now()}`);

  it.only('returns sample characters for the demo user if no characters exist', () => {
    return apiGateway
      .auth('DEMO')
      .get('/characters')
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, testData.sampleCharacters);
      });
  });

  it('returns an empty array if no characters exist for a non-demo user', () => {
    return apiGateway
      .auth(user)
      .get('/characters')
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an('array').with.lengthOf(0);
      });
  });

  it("returns all of the user's characters", () => {
    let testCharacters = [
      { name: 'Full House', type: 'TV Shows', from: 1987, to: 1994 },
      { name: 'Full House', type: 'TV Shows', from: 2016, to: 2017 },
    ];

    return testData.create(user, testCharacters)
      .then(() => apiGateway.auth(user).get('/characters'))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an('array').with.lengthOf(2);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, testCharacters);
      });
  });

  it('returns an empty array if no characters match the criteria', () => {
    let testCharacters = [
      { name: 'TV Dinners', type: 'Food', from: 1954, to: 1961 },
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Vinyl Records', type: 'Music', from: 1984, to: 1985 },
    ];

    return testData.create(user, testCharacters)
      .then(() => apiGateway.auth(user).get('/characters?type=Fashion'))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an('array').with.lengthOf(0);
      });
  });

  it('returns only the characters match the name criteria', () => {
    let testCharacters = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2003, to: 2006 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2013, to: 2013 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
    ];

    return testData.create(user, testCharacters)
      .then(() => apiGateway.auth(user).get('/characters?name=Arrested%20Development'))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an('array').with.lengthOf(2);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, [testCharacters[1], testCharacters[2]]);
      });
  });

  it('returns only the characters match the type criteria', () => {
    let testCharacters = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2003, to: 2006 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2013, to: 2013 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
    ];

    return testData.create(user, testCharacters)
      .then(() => apiGateway.auth(user).get('/characters?type=Toys'))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an('array').with.lengthOf(2);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, [testCharacters[0], testCharacters[3]]);
      });
  });

  it('returns only the characters match the year criteria', () => {
    let testCharacters = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Full House', type: 'TV Shows', from: 1987, to: 1994 },
      { name: 'Full House', type: 'TV Shows', from: 2016, to: 2017 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
    ];

    return testData.create(user, testCharacters)
      .then(() => apiGateway.auth(user).get('/characters?year=1990'))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an('array').with.lengthOf(2);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, [testCharacters[0], testCharacters[1]]);
      });
  });

  it('returns only the characters match both criteria', () => {
    let testCharacters = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'Full House', type: 'TV Shows', from: 1987, to: 1994 },
      { name: 'Full House', type: 'TV Shows', from: 2016, to: 2017 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
    ];

    return testData.create(user, testCharacters)
      .then(() => apiGateway.auth(user).get('/characters?year=1990&type=TV%20Shows'))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an('array').with.lengthOf(1);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, [testCharacters[1]]);
      });
  });

});
