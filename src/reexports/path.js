import path from "path-browserify";

function toNamespacedPath(namespacePath) {
  // Note: this will *probably* throw somewhere.
  if (typeof namespacePath !== "string") {
    return namespacePath;
  }

  if (namespacePath.length === 0) {
    return "";
  }

  const resolvedPath = path.resolve(namespacePath);

  if (resolvedPath.length <= 2) {
    return namespacePath;
  }

  if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
    // Possible UNC root
    if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
      const code = resolvedPath.charCodeAt(2);
      if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
        // Matched non-long UNC root, convert the path to a long UNC path
        return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
      }
    }
  }

  return namespacePath;
}

const {
  basename,
  delimeter,
  dirname,
  extname,
  format,
  isAbsolute,
  join,
  normalize,
  parse,
  posix,
  relative,
  resolve,
  sep,
  win32,
} = path;

export {
  basename,
  delimeter,
  dirname,
  extname,
  format,
  isAbsolute,
  join,
  normalize,
  parse,
  posix,
  relative,
  resolve,
  sep,
  win32,
  toNamespacedPath,
};

path.toNamespacedPath = toNamespacedPath;
export default path;
