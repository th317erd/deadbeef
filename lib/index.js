// Copyright 2023 Wyatt Greenway

/* global DedicatedWorkerGlobalScope */

'use strict';

const DEADBEEF_REF_MAP_KEY  = Symbol.for('@@deadbeefRefMap');
const UNIQUE_ID_SYMBOL      = Symbol.for('@@deadbeefUniqueID');
const refMap                = (globalThis[DEADBEEF_REF_MAP_KEY]) ? globalThis[DEADBEEF_REF_MAP_KEY] : new WeakMap();
const idHelpers             = [];

let uuidCounter = 0n;

const NATIVE_CLASS_TYPE_NAMES = [
  'AggregateError',
  'Array',
  'ArrayBuffer',
  'BigInt',
  'BigInt64Array',
  'BigUint64Array',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'FinalizationRegistry',
  'Float32Array',
  'Float64Array',
  'Function',
  'Int16Array',
  'Int32Array',
  'Int8Array',
  'Map',
  'Number',
  'Object',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint16Array',
  'Uint32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'URIError',
  'WeakMap',
  'WeakRef',
  'WeakSet',
];

const NATIVE_CLASS_TYPES = NATIVE_CLASS_TYPE_NAMES.map((typeName) => globalThis[typeName]).filter(Boolean);

if (!globalThis[DEADBEEF_REF_MAP_KEY]) {
  globalThis[DEADBEEF_REF_MAP_KEY] = refMap;

  // Run all native types first, so the idCounter
  // matches across global contexts
  NATIVE_CLASS_TYPES.forEach((type) => anythingToID(type));

  // Now all common symbols go next
  Object.getOwnPropertyNames(Symbol).sort().forEach((name) => {
    let value = Symbol[name];
    if (typeof value === 'symbol')
      anythingToID(value);
  });

  anythingToID(DEADBEEF_REF_MAP_KEY);
  anythingToID(UNIQUE_ID_SYMBOL);

  // This comes last, because it only exists in some scopes
  if (typeof DedicatedWorkerGlobalScope !== 'undefined')
    anythingToID(DedicatedWorkerGlobalScope);
}

function getHelperForValue(value) {
  for (let i = 0, il = idHelpers.length; i < il; i++) {
    let { helper, generator } = idHelpers[i];
    if (helper(value))
      return generator;
  }
}

function anythingToID(_arg, _alreadyVisited) {
  let opts  = this || {};
  let arg   = _arg;
  if (arg instanceof Number || arg instanceof String || arg instanceof Boolean)
    arg = arg.valueOf();

  let typeOf = typeof arg;

  if (typeOf === 'number' && arg === 0) {
    if (Object.is(arg, -0))
      return 'number:-0';

    return 'number:+0';
  }

  if (typeOf === 'symbol')
    return `symbol:${arg.toString()}`;

  if (arg == null || typeOf === 'number' || typeOf === 'boolean' || typeOf === 'string' || typeOf === 'bigint') {
    if (typeOf === 'number' || typeOf === 'bigint')
      return (arg < 0) ? `${typeOf}:${arg}` : `${typeOf}:+${arg}`;

    return `${typeOf}:${arg}`;
  }

  let idHelper = (idHelpers.length > 0 && getHelperForValue(arg));
  if (idHelper)
    return anythingToID.call(this, idHelper(arg));

  if (opts.custom !== false && UNIQUE_ID_SYMBOL in arg && typeof arg[UNIQUE_ID_SYMBOL] === 'function') {
    let alreadyVisited = _alreadyVisited || new Set();

    // Prevent infinite recursion
    if (!alreadyVisited.has(arg)) {
      alreadyVisited.add(arg);
      return anythingToID.call(this, arg[UNIQUE_ID_SYMBOL](), alreadyVisited);
    }
  }

  if (!refMap.has(arg)) {
    let key = `${typeof arg}:${++uuidCounter}`;
    refMap.set(arg, key);
    return key;
  }

  return refMap.get(arg);
}

function deadbeef() {
  let parts = [ arguments.length ];
  for (let i = 0, il = arguments.length; i < il; i++)
    parts.push(anythingToID.call(this, arguments[i]));

  return parts.join(':');
}

function deadbeefSorted() {
  let parts = [ arguments.length ];
  for (let i = 0, il = arguments.length; i < il; i++)
    parts.push(anythingToID.call(this, arguments[i]));

  return parts.sort().join(':');
}

function generateIDFor(helper, generator) {
  idHelpers.push({ helper, generator });
}

function removeIDGenerator(helper) {
  let index = idHelpers.findIndex((item) => (item.helper === helper));
  if (index < 0)
    return;

  idHelpers.splice(index, 1);
}

Object.defineProperties(deadbeef, {
  'idSym': {
    writable:     true,
    enumerable:   false,
    configurable: true,
    value:        UNIQUE_ID_SYMBOL,
  },
  'sorted': {
    writable:     true,
    enumerable:   false,
    configurable: true,
    value:        deadbeefSorted,
  },
  'generateIDFor': {
    writable:     true,
    enumerable:   false,
    configurable: true,
    value:        generateIDFor,
  },
  'removeIDGenerator': {
    writable:     true,
    enumerable:   false,
    configurable: true,
    value:        removeIDGenerator,
  },
});

module.exports = deadbeef;
