const getMaxMin = function getMaxMin(args) {
  const minVal = Number(args[1]);
  const result = args.length < 3 ? {max: minVal, min: 0} : {max: Number(args[2]), min: minVal};

  if (result.min > result.max) {
    throw new RangeError('"min" must be less than "max"');
  }

  return result;
};

// eslint-disable jsdoc/check-param-names
// noinspection JSCommentMatchesSignature
/**
 * This method clamp a number to min and max limits inclusive.
 *
 * @param {number} value - The number to be clamped.
 * @param {number} [min=0] - The minimum number.
 * @param {number} max - The maximum number.
 * @throws {RangeError} If min > max.
 * @returns {number} The clamped number.
 */
// eslint-enable jsdoc/check-param-names
const clamp = function clamp(value) {
  const number = Number(value);

  if (arguments.length < 2) {
    return number;
  }

  /* eslint-disable-next-line prefer-rest-params */
  const {max, min} = getMaxMin(arguments);

  if (number < min) {
    return min;
  }

  if (number > max) {
    return max;
  }

  return number;
};

const MAX_SAFE_INTEGER = 9007199254740991;
const reIsUint = /^(?:0|[1-9]\d*)$/;
const rxTest = reIsUint.test;

/**
 * This method determines whether the passed value is a zero based index.
 * JavaScript arrays are zero-indexed: the first element of an array is at
 * index 0, and the last element is at the index equal to the value of the
 * array's length property minus 1.
 *
 * @param {number|string} value - The value to be tested for being a zero based index.
 * @param {number} [length=MAX_SAFE_INTEGER] - The length that sets the upper bound.
 * @returns {boolean} A Boolean indicating whether or not the given value is a
 * zero based index within bounds.
 */
const isIndex = function isIndex(value, length) {
  const string = value && value.toString();

  if (rxTest.call(reIsUint, string) === false) {
    return false;
  }

  const number = Number(string);

  if (arguments.length > 1) {
    return number < clamp(length, MAX_SAFE_INTEGER);
  }

  return number < MAX_SAFE_INTEGER;
};

const ALL_PROPERTIES = 0;
const ONLY_WRITABLE = 1;
const ONLY_ENUMERABLE = 2;
const ONLY_CONFIGURABLE = 4;
const SKIP_STRINGS = 8;
const SKIP_SYMBOLS = 16;

export const propertyFilter = {
  ALL_PROPERTIES,
  ONLY_WRITABLE,
  ONLY_ENUMERABLE,
  ONLY_CONFIGURABLE,
  SKIP_STRINGS,
  SKIP_SYMBOLS,
}

export const getOwnNonIndexProperties = function getOwnNonIndexProperties(value, filter) {
  // noinspection JSBitwiseOperatorUsage
  const names = filter & ONLY_ENUMERABLE /* eslint-disable-line no-bitwise */ ? Object.keys(value) : Object.getOwnPropertyNames(value);
  // noinspection JSBitwiseOperatorUsage
  const symbols = filter & SKIP_SYMBOLS /* eslint-disable-line no-bitwise */ ? [] : Object.getOwnPropertySymbols(value);

  return [].concat(names, symbols).filter(function predicate(key) {
    return isIndex(key) === false;
  });
};