'use strict';

const {
  ObjectFreeze,
  SafeFinalizationRegistry,
  SafeSet,
  SafeWeakMap,
  SafeWeakRef,
  SymbolIterator,
} = require("@darkwolf/primordials");

// This class is modified from the example code in the WeakRefs specification:
// https://github.com/tc39/proposal-weakrefs
// Licensed under ECMA's MIT-style license, see:
// https://github.com/tc39/ecma262/blob/HEAD/LICENSE.md
class IterableWeakMap {
  constructor() {
    this._weakMap = new SafeWeakMap();
    this._refSet = new SafeSet();
    this._finalizationGroup = new SafeFinalizationRegistry(cleanup);
  }

  set(key, value) {
    const entry = this._weakMap.get(key);
    if (entry) {
      // If there's already an entry for the object represented by "key",
      // the value can be updated without creating a new WeakRef:
      this._weakMap.set(key, { value, ref: entry.ref });
    } else {
      const ref = new SafeWeakRef(key);
      this._weakMap.set(key, { value, ref });
      this._refSet.add(ref);
      this._finalizationGroup.register(key, {
        set: this._refSet,
        ref
      }, ref);
    }
  }

  get(key) {
    return this._weakMap.get(key)?.value;
  }

  has(key) {
    return this._weakMap.has(key);
  }

  delete(key) {
    const entry = this._weakMap.get(key);
    if (!entry) {
      return false;
    }
    this._weakMap.delete(key);
    this._refSet.delete(entry.ref);
    this._finalizationGroup.unregister(entry.ref);
    return true;
  }

  [SymbolIterator]() {
    const iterator = this._refSet[SymbolIterator]();

    const next = () => {
      const result = iterator.next();
      if (result.done) return result;
      const key = result.value.deref();
      if (key == null) return next();
      const { value } = this._weakMap.get(key);
      return { done: false, value };
    };

    return {
      [SymbolIterator]() { return this; },
      next,
    };
  }
}

function cleanup({ set, ref }) {
  set.delete(ref);
}

ObjectFreeze(IterableWeakMap.prototype);

module.exports = {
  IterableWeakMap,
};
