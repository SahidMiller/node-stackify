import crypto from "crypto-browserify";
import md4 from "js-md4";

const createSign = crypto.createSign;
crypto.createSign = ((algo) => {
  algo = algo === "sha1" ? "RSA-SHA1" : algo;
  return createSign(algo);
}).bind(crypto);

const createHash = crypto.createHash;
crypto.createHash = ((algo) => {
  if (algo === "md4") {
    const md4Hasher = md4.create();
    const origDigest = md4Hasher.digest.bind(md4Hasher);
    md4Hasher.digest = (encoding) => {
      return Buffer.from(origDigest(encoding)).toString(encoding);
    };

    return md4Hasher;
  }
  return createHash(algo);
}).bind(crypto);

export * from "crypto-browserify";
export default crypto;
