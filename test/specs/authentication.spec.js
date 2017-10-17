'use strict';

const apiGateway = require('../fixtures/apiGateway');
const assert = require('../fixtures/assert');

describe('Authentication', () => {

  it('returns demo data if no API Key is provided', () => {
    return apiGateway
      .auth(null)
      .get('/characters')
      .then(res => {
        let body = assert.isSuccessfulResponse(res, 200);
        body.should.be.an('array').with.length.above(0);
      });
  });

  it('returns an error if the API Key is invalid', () => {
    return apiGateway
      .auth('Invalid API Key')
      .get('/characters')
      .then(res => {
        let body = assert.isErrorResponse(res, 401);
        body.error.should.equal('UNAUTHORIZED');
        body.message.should.equal('The X-API-Key header must be an alphanumeric string');
      });
  });

  it('returns an error if the API Key is too short', () => {
    return apiGateway
      .auth('A')
      .get('/characters')
      .then(res => {
        let body = assert.isErrorResponse(res, 401);
        body.error.should.equal('UNAUTHORIZED');
        body.message.should.equal('The X-API-Key header is too short');
      });
  });

  it('returns an error if the API Key is too long', () => {
    return apiGateway
      .auth('A'.repeat(51))
      .get('/characters')
      .then(res => {
        let body = assert.isErrorResponse(res, 401);
        body.error.should.equal('UNAUTHORIZED');
        body.message.should.equal('The X-API-Key header is too long');
      });
  });

});
