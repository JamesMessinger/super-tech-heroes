'use strict';

const fs = require('fs');
const accept = require('accept');
const util = require('../util');
const Response = require('../Response');
const manifest = require('../../package.json');

const formats = [
  {
    schemaPath: 'lib/schemas/openapi.json',
    contentType: 'application/openapi+json;version=3.0',
    accept: [
      'application/json',
      'application/openapi',
      'application/openapi+json',
      'application/openapi+json;version=3.0',
    ]
  },
  {
    schemaPath: 'lib/schemas/openapi.yaml',
    contentType: 'application/openapi+yaml;version=3.0',
    accept: [
      'text/yaml',
      'application/openapi+yaml',
      'application/openapi+yaml;version=3.0',
    ]
  },
  {
    schemaPath: 'lib/schemas/swagger.json',
    contentType: 'application/openapi+json;version=2.0',
    accept: [
      'application/swagger',
      'application/swagger+json',
      'application/openapi+json;version=2.0',
    ]
  },
  {
    schemaPath: 'lib/schemas/swagger.yaml',
    contentType: 'application/openapi+yaml;version=2.0',
    accept: [
      'application/swagger+yaml',
      'application/openapi+yaml;version=2.0',
    ]
  },
];

module.exports = apiSchema;

/**
 * Returns the API schema in various formats
 *
 * @param {object} args.request - The incoming HTTP request
 * @returns {Promsie<object>} - Resolves with the HTTP response object
 */
function apiSchema ({ request }) {
  let format;

  return Promise.resolve()
    .then(() => {
      format = negotiate(request);
      return util.promisify(fs.readFile)(format.schemaPath, 'utf8');
    })
    .then(schema => {
      // Replace placeholders
      schema = schema.replace(/API_NAME/g, manifest.name);
      schema = schema.replace(/API_VERSION/g, manifest.version);
      schema = schema.replace(/API_DESCRIPTION/g, manifest.description);

      return Response.ok(schema, { 'Content-Type': format.contentType });
    });
}

/**
 * Determines which format to send, based on the Accept header
 *
 * @param {object} request - The incoming HTTP request
 * @returns {{ schemaPath: string, contentType: string }}
 */
function negotiate (request) {
  // Parse the Accept header (or querystring parameter)
  let acceptQuery = getAcceptQuery(request);
  let acceptHeader = util.findHeader(request.headers, 'Accept');
  let mimeTypes = accept.mediaTypes(acceptQuery || acceptHeader);

  // Return the first supported format
  for (let mimeType of mimeTypes) {
    for (let format of formats) {
      if (format.accept.includes(mimeType)) {
        return format;
      }
    }
  }

  // Nothig matched, so return the default format
  return formats[0];
}

/**
 * Returns the value of the `accept` query parameter, if any.
 * This function accounts for erroneous querystring parsing done by AWS API Gateway.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {?string}
 */
function getAcceptQuery (request) {
  let query = (request.queryStringParameters || {});

  if (query.accept) {
    // The "+" character gets parsed as a space, so convert it back to a "+"
    let acceptQuery = query.accept.replace('openapi ', 'openapi+');

    if (!acceptQuery.includes(';version') && query.version) {
      // The ";version=X.X" gets parsed as a separate query param, so merge it back
      acceptQuery += `;version=${query.version}`;
    }

    return acceptQuery;
  }
}
