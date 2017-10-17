'use strict';

const util = require('./util');
const serializeError = require('serialize-error');

let log = module.exports = {
  /**
   * Logs the incoming HTTP request
   *
   * @param {object} request - The incoming HTTP request
   * @param {object} [context] - The AWS Lambda context object
   * @returns {object} - Returns the request
   */
  request (request, context) {
    let entry = createLogEntry(request, context);

    entry.referrer = util.findHeader(request.headers, 'Referer') || util.findHeader(request.headers, 'Referrer');
    entry.userAgent = util.findHeader(request.headers, 'User-Agent');
    entry.country = util.findHeader(request.headers, 'CloudFront-Viewer-Country');
    entry.ip = util.findHeader(request.headers, 'X-Forwarded-For') ||
      (request.requestContext && request.requestContext.identity && request.requestContext.identity.sourceIp);

    log.write('info', entry);
    return request;
  },

  /**
   * Logs the HTTP response
   *
   * @param {object} response - The HTTP response
   * @param {object} [request] - The incoming HTTP request
   * @param {object} [context] - The AWS Lambda context object
   * @returns {object} - Returns the response
   */
  response (response, request, context) {
    let entry = createLogEntry(request, context);

    // Insert response info at the beginning of the object
    entry = Object.assign({ status: response.statusCode }, entry);

    if (response.statusCode < 400) {
      log.write('info', entry);
    }
    else {
      // Extract the error code from the response body
      let match = /"error":"(.*?)"/.exec(response.body);
      entry.error = match && match[1];
      log.write('warn', entry);
    }

    return response;
  },

  /**
   * Logs an error that occurred while processing an HTTP request
   *
   * @param {Error} error - The error that occurred
   * @param {object} [request] - The incoming HTTP request
   * @param {object} [context] - The AWS Lambda context object
   */
  error (error, request, context) {
    let errorPojo = serializeError(error);
    let entry = createLogEntry(request, context);
    log.write('error', Object.assign(entry, errorPojo));
  },

  /**
   * Writes the given data to the console, except in test mode.
   *
   * @param {string} level - The log level (e.g. "info", "error", "warn")
   * @param {object} data - The JSON data to log
   */
  write (level, data) {
    if (process.env.NODE_ENV !== 'test') {
      console[level](data);
    }
  }
};

/**
 * Creates a log entry that contains essential information about the current HTTP request.
 *
 * @param {object} [request] - The incoming HTTP request
 * @param {object} [context] - The AWS Lambda context object
 * @returns {object} - Returns the log entry object
 */
function createLogEntry (request, context) {
  let entry = {};

  if (request) {
    entry.method = request.httpMethod;
    entry.path = request.path;
    entry.user = util.findHeader(request.headers, 'X-API-Key');
  }

  if (context) {
    entry.requestId = context.awsRequestId || context.invokeid;
    entry.functionVersion = context.functionVersion;
    entry.functionTimeout = context.getRemainingTimeInMillis();
  }

  return entry;
}
