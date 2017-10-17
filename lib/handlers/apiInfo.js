'use strict';

const util = require('../util');
const Response = require('../Response');
const manifest = require('../../package.json');

module.exports = apiInfo;

/**
 * Returns information about the Super Tech Heroes API.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function apiInfo (request) {
  return Promise.resolve()
    .then(() => {
      let hostname = util.getHostName(request);

      return Response.ok({
        name: 'Super Tech Heroes API',
        version: manifest.version,
        description: manifest.description,
        links: {
          characters: `${hostname}/characters`,
          www: manifest.homepage,
          docs: 'https://documenter.getpostman.com/view/220187/super-tech-heroes-api/XXXXXXX',
        }
      });
    });
}
