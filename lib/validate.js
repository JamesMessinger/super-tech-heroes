'use strict';

const Response = require('./Response');

const guidPattern = /^[a-f0-9]{32}$/;
const userPattern = /^[a-z0-9]+$/i;

/**
 * Provides validation methods for fields.
 */
let validate = module.exports = {
  /**
   * Determines whether the specified value is a valid GUID (32 digit hex, without dashes)
   *
   * @param {*} value - The value to inspect
   * @returns {boolean}
   */
  isGuid (value) {
    return guidPattern.test(value);
  },

  /**
   * Throws an error unless the specified value is a valid GUID (32 digit hex, without dashes)
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {string} - Returns the GUID
   */
  guid (field, value) {
    validate.nonEmptyString(field, value);

    if (!guidPattern.test(value)) {
      throw Response.badRequest(`The "${field}" value must be a GUID (32 digit hex, without dashes)`);
    }

    return value;
  },

  /**
   * Throws an error unless the specified value is a valid User ID (alphanumeric string)
   *
   * @param {*} value - The value to validate
   * @returns {string} - Returns the User ID
   */
  user (value) {
    validate.nonEmptyString('X-API-Key', value);

    if (!userPattern.test(value)) {
      throw Response.unauthorized('The X-API-Key header must be an alphanumeric string');
    }
    else if (value.length < 4) {
      throw Response.unauthorized('The X-API-Key header is too short');
    }
    else if (value.length > 50) {
      throw Response.unauthorized('The X-API-Key header is too long');
    }

    return value;
  },

  /**
   * Throws an error unless the specified value is a string with at least one non-whitespace character.
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {string} - Returns the string
   */
  nonEmptyString (field, value) {
    if (typeof value !== 'string') {
      throw Response.badRequest(`The "${field}" value must be a string`);
    }
    if (!value || value.trim().length === 0) {
      throw Response.badRequest(`The "${field}" value is missing`);
    }

    return value;
  },

  /**
   * Throws an error if the specified string is longer than the specified maximum.
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @param {number} max - The maximum allowed length
   * @returns {string} - Returns the string
   */
  maxLength (field, value, max) {
    if (value.length > max) {
      throw Response.badRequest(`The "${field}" value is too long (${max} characters max)`);
    }

    return value;
  },

  /**
   * Throws an error unless the specified value is a number that's a positive integer.
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @returns {string} - Returns the number
   */
  positiveInteger (field, value) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw Response.badRequest(`The "${field}" value must be a number`);
    }
    else if (!Number.isInteger(value) || !isFinite(value)) {
      throw Response.badRequest(`The "${field}" value must be an integer`);
    }
    else if (value <= 0) {
      throw Response.badRequest(`The "${field}" value must be a positive integer`);
    }

    return value;
  },

  /**
   * Throws an error unless the specified value is one of the allowed values.
   *
   * @param {string} field - The name of the field that's being validated
   * @param {*} value - The value to validate
   * @param {array} allowedValues - The values that are allowed
   * @returns {string} - Returns the number
   */
  oneOf (field, value, allowedValues) {
    if (allowedValues.indexOf(value) === -1) {
      throw Response.badRequest(`The "${field}" value must be ${commaList(allowedValues, 'or')}`);
    }

    return value;
  },

};

/**
 * Returns an array as a comma-delimited string with a conjunction
 * (e.g. "apples", "oranges", and "pears")
 */
function commaList (list, conjunction = 'and') {
  let firstItems = list.slice(0, -1);
  let lastItem = list[list.length - 1];

  return '"' + firstItems.join('", "') + '", ' + conjunction + ' "' + lastItem + '"';
}
