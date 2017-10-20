'use strict';

const log = require('./log');
const util = require('./util');
const validate = require('./validate');
const Response = require('./Response');

const routes = [
  {
    pattern: /^\/?$/i,
    GET: require('./handlers/apiInfo'),
  },
  {
    pattern: /^\/characters\/?$/i,
    GET: require('./handlers/findCharacters'),
    POST: require('./handlers/createCharacter'),
  },
  {
    pattern: /^\/characters\/.+?\/?$/i,
    PUT: require('./handlers/updateCharacter'),
    DELETE: require('./handlers/deleteCharacter'),
  },
];

/**
 * Handles an incoming HTTP request from AWS API Gateway
 *
 * @param {object} request - The incoming HTTP request
 * @param {object} context - The AWS Lambda context object
 * @param {function} callback - The callback to send the HTTP response
 */
exports.handler = (request, context, callback) => {
  Promise.resolve()
    .then(() => log.request({ request, context }))
    .then(() => authenticateRequest(request))
    .then(() => parseRequest(request))
    .then(() => findHandler(request))
    .then(({ handler, id }) => handler({ request, context, id }))
    .catch(error => {
      log.error({ error, request, context });
      return Response.error(error);
    })
    .then(response => log.response({ response, request, context }))
    .then(response => callback(null, response));
};

/**
 * Ensures that the incoming HTTP request has a valid X-API-Key.
 * If the key is not set at all, then it will be set to "DEMO".
 * If it is set, but the value is invalid, then an error will be thrown.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {object} - Returns the authenticated request
 */
function authenticateRequest (request) {
  let apiKey = util.findHeader(request.headers, 'X-API-Key');

  if (!apiKey) {
    // No API key was provided, so default to the "DEMO" account
    request.headers['X-API-Key'] = 'DEMO';
  }
  else {
    validate.user(apiKey);
  }

  return request;
}

/**
 * Parses the body of the incoming HTTP request, if applicable.
 *
 * @param {object} request - The incoming HTTP request
 * @returns {object} - Returns the parsed request
 */
function parseRequest (request) {
  let { path, httpMethod, body } = request;

  if (httpMethod === 'POST' || httpMethod === 'PUT') {
    let contentType = util.findHeader(request.headers, 'Content-Type');

    if (contentType.toLowerCase().indexOf('application/json') === -1) {
      throw Response.badRequest(`The ${httpMethod} ${path} endpoint requires application/json content`);
    }
    else if (body.trim().length === 0) {
      throw Response.badRequest('The request body is empty');
    }

    try {
      request.body = JSON.parse(body);
    }
    catch (error) {
      throw Response.badRequest(`Error parsing JSON content. ${error.message}`);
    }
  }

  return request;
}

/**
 * Finds the correct handler function for the incoming HTTP request.
 *
 * @param {object} request - The incoming HTTP request
 * @param {string} request.path - The URL path (e.g. "/characters/12345")
 * @param {string} request.httpMethod - The HTTP method (e.g. "GET")
 * @returns {function} - Resolves with the handler function
 */
function findHandler ({ path, httpMethod }) {
  // Find the route whose RegEx pattern matches the path
  let route = routes.find(r => r.pattern.test(path));
  if (!route) {
    throw Response.pathNotFound(`The Super Tech Heroes API does not have a ${path} endpoint`);
  }

  // Find the handler function for the HTTP method
  let handler = route[httpMethod];
  if (!handler) {
    throw Response.methodNotAllowed(`The ${path} endpoint does not allow ${httpMethod}`);
  }

  return handler;
}
