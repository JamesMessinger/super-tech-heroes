'use strict';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

/**
 * An HTTP response, in the format that's required by AWS API Gateway.
 */
class Response {
  /**
   * Creates an HTTP 200 (OK) response
   *
   * @param {object|string} body - The data to send
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static ok (body, headers) {
    return new Response(200, body, headers);
  }

  /**
   * Creates an HTTP 201 (Created) response
   *
   * @param {object|string} body - The data to send
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static created (body, headers) {
    return new Response(201, body, headers);
  }

  /**
   * Creates an HTTP 400 (Bad Request) response.
   *
   * @param {string} message - The error message
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static badRequest (message, headers) {
    return new Response(400, { error: 'BAD_REQUEST', message }, headers);
  }

  /**
   * Creates an HTTP 401 (Unauthorized) response.
   *
   * @param {string} message - The error message
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static unauthorized (message, headers) {
    return new Response(401, { error: 'UNAUTHORIZED', message }, headers);
  }

  /**
   * Creates an HTTP 404 (Not Found) response that indicates that the URL path could not be found
   * (as opposed to a path with an ID that can't be found in the database).
   *
   * @param {string} message - The error message
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static pathNotFound (message, headers) {
    return new Response(404, { error: 'BAD_PATH', message }, headers);
  }

  /**
   * Creates an HTTP 404 (Not Found) response that indicates that the specified resource
   * could not be found in the database.
   *
   * @param {string} message - The error message
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static resourceNotFound (message, headers) {
    return new Response(404, { error: 'NOT_FOUND', message }, headers);
  }

  /**
   * Creates an HTTP 405 (Method Not Allowed) response.
   *
   * @param {string} message - The error message
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static methodNotAllowed (message, headers) {
    return new Response(405, { error: 'BAD_METHOD', message }, headers);
  }

  /**
   * Creates an HTTP 409 (Conflict) response.
   *
   * @param {string} message - The error message
   * @param {object} [headers] - HTTP headers
   * @returns {Response}
   */
  static conflict (message, headers) {
    return new Response(409, { error: 'CONFLICT', message }, headers);
  }

  /**
   * Creates a {@link Response} object from an {@link Error} object.
   *
   * @param {Error} error - The error object
   * @returns {Response}
   */
  static error (error) {
    if (error instanceof Response) {
      return error;
    }
    else {
      let errorMessage = error.message;

      // In dev or test mode, show the full error stack
      if (['development', 'test'].includes(process.env.NODE_ENV)) {
        errorMessage = error.stack;
      }

      return new Response(
        error.statusCode || 500,
        {
          error: error.code || 'SERVER_ERROR',
          message: errorMessage || 'An error occurred on the server',
        }
      );
    }
  }

  /**
   * Creates an HTTP response.
   *
   * @param {number} statusCode - The HTTP status code
   * @param {object|string} body - The JSON body
   * @param {object} [headers] - HTTP headers
   */
  constructor (statusCode, body, headers) {
    this.statusCode = statusCode;
    this.headers = Object.assign({}, defaultHeaders, headers);

    if (typeof body === 'object') {
      this.body = JSON.stringify(body);
    }
    else {
      this.body = body;
    }
  }
}

module.exports = Response;
