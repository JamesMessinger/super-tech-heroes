"use strict";

// NOTE: Environment variables must be set BEFORE loading the API
require("./environment");

const _ = require("lodash");
const uuid = require("uuid");
const querystring = require("querystring");
const requestTemplate = require("../../bin/request-template.json");
const contextTemplate = require("../../bin/context-template.json");
const util = require("../../lib/util");
const superTechHeroesAPI = require("../../lib");

let apiKey = "";

let apiGateway = module.exports = {
  auth: (userId) => {
    apiKey = userId;
    return apiGateway;
  },

  get: (path) => sendRequest("GET", path),
  post: (path, data) => sendRequest("POST", path, data),
  put: (path, data) => sendRequest("PUT", path, data),
  delete: (path) => sendRequest("DELETE", path),
};

/**
 * Calls the Trensdetter Lambda function the same way that it gets called by AWS API Gateway.
 *
 * @param {string} method - The HTTP method (e.g. "GET")
 * @param {string} path - The URL path (e.g. "/characters")
 * @param {object} [data] - Key/value data to send
 * @returns {Promise<object>} - The promise is fulfilled with the HTTP response object
 */
function sendRequest (method, path, data) {
  return Promise.resolve()
    .then(() => {
      let request = createRequest(method, path, data);
      let context = createContext(request);

      return util.promisify(superTechHeroesAPI.handler)(request, context);
    });
}

/**
 * Creates an AWS API Gateway request object
 *
 * @param {string} method - The HTTP method (e.g. "GET")
 * @param {string} path - The URL path (e.g. "/characters")
 * @param {object} [data] - Key/value data to send
 * @returns {object}
 */
function createRequest (method, path, data) {
  let query;
  [path, query] = path.split("?");

  let request = _.cloneDeep(requestTemplate);

  request.path = path;
  request.httpMethod = method;
  request.headers.Host = "localhost";
  request.pathParameters.proxy = path;
  request.queryStringParameters = query && querystring.parse(query);
  request.requestContext.path = path;
  request.requestContext.requestId = uuid.v4();

  if (data) {
    request.headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(data);
  }

  if (typeof apiKey === "string") {
    request.headers["X-API-Key"] = apiKey;
  }

  return request;
}

/**
 * Creates an AWS API Gateway context object
 *
 * @param {object} apiGatewayRequest - The AWS API Gateway request object
 * @param {function} resolve - The callback to call when the Lambda exits successfully
 * @param {function} reject - The callback to call when the Lambda throws an error
 * @returns {object}
 */
function createContext (apiGatewayRequest) {
  let context = _.cloneDeep(contextTemplate);

  context.invokeid = apiGatewayRequest.requestContext.requestId;
  context.awsRequestId = apiGatewayRequest.requestContext.requestId;
  context.getRemainingTimeInMillis = () => 3000;

  return context;
}
