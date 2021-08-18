"use strict";

import errors from "./errors.js";
const {
  hideStackFrames,
  codes: {
    ERR_INVALID_ARG_TYPE,
    ERR_INVALID_ARG_VALUE,
    ERR_OUT_OF_RANGE,
    ERR_INVALID_CALLBACK,
  },
} = errors;

const validateFunction = hideStackFrames((value, name) => {
  if (typeof value !== "function")
    throw new ERR_INVALID_ARG_TYPE(name, "Function", value);
});

const validateObject = hideStackFrames(
  (
    value,
    name,
    { nullable = false, allowArray = false, allowFunction = false } = {}
  ) => {
    if (
      (!nullable && value === null) ||
      (!allowArray && value instanceof Array) ||
      (typeof value !== "object" &&
        (!allowFunction || typeof value !== "function"))
    ) {
      throw new ERR_INVALID_ARG_TYPE(name, "Object", value);
    }
  }
);

function isUint32(value) {
  return value === value >>> 0;
}

const validateUint32 = hideStackFrames((value, name, positive) => {
  if (!isUint32(value)) {
    if (typeof value !== "number") {
      throw new ERR_INVALID_ARG_TYPE(name, "number", value);
    }
    if (!Number.isInteger(value)) {
      throw new ERR_OUT_OF_RANGE(name, "an integer", value);
    }
    const min = positive ? 1 : 0;
    // 2 ** 32 === 4294967296
    throw new ERR_OUT_OF_RANGE(name, `>= ${min} && < 4294967296`, value);
  }
  if (positive && value === 0) {
    throw new ERR_OUT_OF_RANGE(name, ">= 1 && < 4294967296", value);
  }
});

function validateString(value, name) {
  if (typeof value !== "string")
    throw new ERR_INVALID_ARG_TYPE(name, "string", value);
}

const validateArray = hideStackFrames((value, name, { minLength = 0 } = {}) => {
  if (!(value instanceof Array)) {
    throw new ERR_INVALID_ARG_TYPE(name, "Array", value);
  }
  if (value.length < minLength) {
    const reason = `must be longer than ${minLength}`;
    throw new ERR_INVALID_ARG_VALUE(name, value, reason);
  }
});

const validateCallback = hideStackFrames((callback) => {
  if (typeof callback !== "function") throw new ERR_INVALID_CALLBACK(callback);
});

const validateUndefined = hideStackFrames((value, name) => {
  if (value !== undefined)
    throw new ERR_INVALID_ARG_TYPE(name, "undefined", value);
});

const validateAbortSignal = hideStackFrames((signal, name) => {
  if (
    signal !== undefined &&
    (signal === null || typeof signal !== "object" || !("aborted" in signal))
  ) {
    throw new ERR_INVALID_ARG_TYPE(name, "AbortSignal", signal);
  }
});

import * as self from "./validators.js";
export default self;
export {
  validateUndefined,
  validateCallback,
  validateUint32,
  validateString,
  validateArray,
  validateAbortSignal,
  validateObject,
  validateFunction,
};
