'use strict';

const apiGateway = require('../fixtures/apiGateway');
const testData = require('../fixtures/testData');
const assert = require('../fixtures/assert');

describe.skip('Create new characters', () => {

  // Create a unique User ID for each test, so we know we won't conflict with existing characters
  let user;
  beforeEach(() => user = `${Date.now()}`);

  it('can create a new character', () => {
    let newCharacter = {
      name: 'My new character',
      type: 'Some Type',
      from: 2000,
      to: 2001,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let character = assert.isSuccessfulResponse(res, 201);
        assert.isValidCharacter(character);
        assert.matchesTestData(character, newCharacter);
        character.should.not.equal(newCharacter);
      });
  });

  it('should set the "Location" header to the character\'s URL', () => {
    let newCharacter = {
      name: 'Something trendy',
      type: 'test',
      from: 1800,
      to: 1900,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let character = assert.isSuccessfulResponse(res, 201);
        assert.isValidCharacter(character);
        res.headers.should.have.property('Location', character.links.self);
      });
  });

  it('should return an error if the character was popular within the past 10 years', () => {
    let testCharacters = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2003, to: 2006 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2013, to: 2013 },
    ];

    let newCharacter = {
      name: 'My Little Pony',
      type: 'Different Type',
      from: 2017,
      to: 2018,
    };

    return testData.create(user, testCharacters)
      .then(() => apiGateway.auth(user).post('/characters', newCharacter))
      .then(res => {
        let body = assert.isErrorResponse(res, 409);
        body.error.should.equal('CONFLICT');
        body.message.should.equal('My Little Pony was trendy in 2014. It can\'t be trendy again until 2025.');
      });
  });

  it('should return an error if the character was popular within the next 10 years', () => {
    let testCharacters = [
      { name: 'My Little Pony', type: 'Toys', from: 1983, to: 1992 },
      { name: 'My Little Pony', type: 'Toys', from: 2010, to: 2014 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2003, to: 2006 },
      { name: 'Arrested Development', type: 'TV Shows', from: 2013, to: 2013 },
    ];

    let newCharacter = {
      name: 'My Little Pony',
      type: 'Different Type',
      from: 1978,
      to: 1980,
    };

    return testData.create(user, testCharacters)
      .then(() => apiGateway.auth(user).post('/characters', newCharacter))
      .then(res => {
        let body = assert.isErrorResponse(res, 409);
        body.error.should.equal('CONFLICT');
        body.message.should.equal('My Little Pony was trendy in 1983. It can\'t be trendy between 1972 and 1983.');
      });
  });

  it('should return an error if the character has an ID', () => {
    let newCharacter = {
      id: 'abcdef1234567890abcdef1234567890',
      name: 'Character with an ID',
      type: 'test',
      from: 1850,
      to: 1850,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('You can\'t set "id" value when creating a character');
      });
  });

  it('should return an error if the character has no name', () => {
    let newCharacter = {
      type: 'test',
      from: 1850,
      to: 1850,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The "name" value is missing');
      });
  });

  it('should return an error if the name is too long', () => {
    let newCharacter = {
      name: 'name'.repeat(50),
      type: 'test',
      from: 1850,
      to: 1850,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The "name" value is too long (50 characters max)');
      });
  });

  it('should return an error if the character has no type', () => {
    let newCharacter = {
      name: 'Character with no type',
      from: 1850,
      to: 1850,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The "type" value is missing');
      });
  });

  it('should return an error if the type is too long', () => {
    let newCharacter = {
      name: 'Character with loooong type',
      type: 'type'.repeat(50),
      from: 1850,
      to: 1850,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The "type" value is too long (50 characters max)');
      });
  });

  it('should return an error if the character has no year', () => {
    let newCharacter = {
      name: 'Character with no from year',
      type: 'test type',
      to: 1850,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The "from" value is missing');
      });
  });

  it('should return an error if the character has a non-numeric year', () => {
    let newCharacter = {
      name: 'Character with a non-numeric year',
      type: 'test type',
      from: 1850,
      to: 'hello world',
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The "to" value must be a number (a 4 digit year)');
      });
  });

  it('should return an error if the year is too long ago', () => {
    let newCharacter = {
      name: 'Character with a really old year',
      type: 'test type',
      from: 123,
      to: 456,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The year 123 was too long ago. Try something newer.');
      });
  });

  it('should return an error if the year is too far in the future', () => {
    let newCharacter = {
      name: 'Character with a future year',
      type: 'test type',
      from: 1980,
      to: 2050,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The year 2050 is too far away. Stick with recent characters.');
      });
  });

  it('should return an error if the date range is reversed', () => {
    let newCharacter = {
      name: 'Character with bad date range',
      type: 'test type',
      from: 2001,
      to: 1990,
    };

    return apiGateway
      .auth(user)
      .post('/characters', newCharacter)
      .then(res => {
        let body = assert.isErrorResponse(res, 400);
        body.error.should.equal('BAD_REQUEST');
        body.message.should.equal('The "from" year can\'t be greater than the "to" year');
      });
  });

});
