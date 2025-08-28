
let imports = {};
imports['__wbindgen_placeholder__'] = module.exports;
let wasm;

// Browser-compatible TextEncoder/TextDecoder handling
let TextEncoder, TextDecoder;
if (typeof window !== 'undefined' && window.TextEncoder && window.TextDecoder) {
    // Browser environment
    TextEncoder = window.TextEncoder;
    TextDecoder = window.TextDecoder;
} else if (typeof globalThis !== 'undefined' && globalThis.TextEncoder && globalThis.TextDecoder) {
    // Modern environment
    TextEncoder = globalThis.TextEncoder;
    TextDecoder = globalThis.TextDecoder;
} else if (typeof global !== 'undefined' && global.TextEncoder && global.TextDecoder) {
    // Node.js with polyfills
    TextEncoder = global.TextEncoder;
    TextDecoder = global.TextDecoder;
} else {
    // Node.js environment - require from util
    try {
        const util = require('util');
        TextEncoder = util.TextEncoder;
        TextDecoder = util.TextDecoder;
    } catch (e) {
        // If all else fails, throw a meaningful error
        throw new Error('TextEncoder/TextDecoder not available in this environment');
    }
}

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

// Create TextEncoder instance - browser doesn't accept 'utf-8' parameter
let cachedTextEncoder = typeof window !== 'undefined' ? new TextEncoder() : new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_4.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

// Create TextDecoder instance - browser version has slightly different options
let cachedTextDecoder = typeof window !== 'undefined' 
    ? new TextDecoder() 
    : new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
/**
 * Get the version of the crate (useful for testing the package).
 * @returns {string}
 */
module.exports.version = function() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.version();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
};

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_4.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * Deserialize the `Uint8Array`` bytecode into a JSON object.
 * The JSON object contains the ABI (Application Binary Interface) of the module.
 *
 * ```javascript
 * import * as template from '@mysten/move-binary-template';
 *
 * const json = template.deserialize( binary );
 * console.log( json, json.identifiers );
 * ```
 * @param {Uint8Array} binary
 * @returns {any}
 */
module.exports.deserialize = function(binary) {
    const ptr0 = passArray8ToWasm0(binary, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.deserialize(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
};

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * Update the identifiers in the module bytecode, given a map of old -> new identifiers.
 * Returns the updated bytecode.
 *
 * ```javascript
 * import * as template from '@mysten/move-binary-template';
 *
 * const updated = template.update_identifiers( binary, {
 *     'TEMPLATE': 'NEW_VALUE',
 *     'template': 'new_value',
 *     'Name':     'NewName'
 * });
 * ```
 * @param {Uint8Array} binary
 * @param {any} map
 * @returns {Uint8Array}
 */
module.exports.update_identifiers = function(binary, map) {
    const ptr0 = passArray8ToWasm0(binary, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.update_identifiers(ptr0, len0, map);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v2 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v2;
};

/**
 * Updates a constant in the constant pool. Because constants don't have names,
 * the only way to identify them is by their type and value.
 *
 * The value of a constant is BCS-encoded and the type is a string representation
 * of the `SignatureToken` enum. String identifier for `SignatureToken` is a
 * capitalized version of the type: U8, Address, Vector(Bool), Vector(U8), etc.
 *
 * ```javascript
 * import * as template from '@mysten/move-binary-template';
 * import { bcs } from '@mysten/bcs';
 *
 * let binary = template.update_constants(
 *     binary, // Uint8Array
 *     bcs.u64().serialize(0).toBytes(),      // new value
 *     bcs.u64().serialize(100000).toBytes(), // old value
 *     'U64'                                  // type
 * );
 * ```
 * @param {Uint8Array} binary
 * @param {Uint8Array} new_value
 * @param {Uint8Array} expected_value
 * @param {string} expected_type
 * @returns {Uint8Array}
 */
module.exports.update_constants = function(binary, new_value, expected_value, expected_type) {
    const ptr0 = passArray8ToWasm0(binary, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passArray8ToWasm0(new_value, wasm.__wbindgen_malloc);
    const len1 = WASM_VECTOR_LEN;
    const ptr2 = passArray8ToWasm0(expected_value, wasm.__wbindgen_malloc);
    const len2 = WASM_VECTOR_LEN;
    const ptr3 = passStringToWasm0(expected_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len3 = WASM_VECTOR_LEN;
    const ret = wasm.update_constants(ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v5 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v5;
};

/**
 * Convenience method to analyze the constant pool; returns all constants in order
 * with their type and BCS value.
 *
 * ```javascript
 * import * as template from '@mysten/move-binary-template';
 *
 * let consts = template.get_constants(binary);
 * ```
 * @param {Uint8Array} binary
 * @returns {any}
 */
module.exports.get_constants = function(binary) {
    const ptr0 = passArray8ToWasm0(binary, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.get_constants(ptr0, len0);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
};

/**
 * Serialize the JSON module into a `Uint8Array` (bytecode).
 * @param {any} json_module
 * @returns {Uint8Array}
 */
module.exports.serialize = function(json_module) {
    const ret = wasm.serialize(json_module);
    if (ret[3]) {
        throw takeFromExternrefTable0(ret[2]);
    }
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
};

const ConstantFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_constant_free(ptr >>> 0, 1));
/**
 * A transformed constant from the constant pool.
 */
class Constant {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ConstantFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_constant_free(ptr, 0);
    }
}
module.exports.Constant = Constant;

module.exports.__wbg_String_eecc4a11987127d6 = function(arg0, arg1) {
    const ret = String(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbg_buffer_a215fd0f9dbb5414 = function(arg0) {
    const ret = arg0.buffer;
    return ret;
};

module.exports.__wbg_call_aa20ca83b389253c = function() { return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
}, arguments) };

module.exports.__wbg_done_b00ac79b7cf688ec = function(arg0) {
    const ret = arg0.done;
    return ret;
};

module.exports.__wbg_entries_2aaa882d15c26fd0 = function(arg0) {
    const ret = Object.entries(arg0);
    return ret;
};

module.exports.__wbg_get_142c69a0a38ca3a9 = function(arg0, arg1) {
    const ret = arg0[arg1 >>> 0];
    return ret;
};

module.exports.__wbg_get_9528546d1b415178 = function() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
}, arguments) };

module.exports.__wbg_getwithrefkey_6550b2c093d2eb18 = function(arg0, arg1) {
    const ret = arg0[arg1];
    return ret;
};

module.exports.__wbg_instanceof_ArrayBuffer_b19b33ccadb20395 = function(arg0) {
    let result;
    try {
        result = arg0 instanceof ArrayBuffer;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

module.exports.__wbg_instanceof_Uint8Array_ee46a70987a1d66b = function(arg0) {
    let result;
    try {
        result = arg0 instanceof Uint8Array;
    } catch (_) {
        result = false;
    }
    const ret = result;
    return ret;
};

module.exports.__wbg_isArray_643b5b2b3afb0871 = function(arg0) {
    const ret = Array.isArray(arg0);
    return ret;
};

module.exports.__wbg_isSafeInteger_1c660d27c689f62a = function(arg0) {
    const ret = Number.isSafeInteger(arg0);
    return ret;
};

module.exports.__wbg_iterator_c397425a538e3b86 = function() {
    const ret = Symbol.iterator;
    return ret;
};

module.exports.__wbg_length_1799fd5bf657c257 = function(arg0) {
    const ret = arg0.length;
    return ret;
};

module.exports.__wbg_length_621925723fc28f40 = function(arg0) {
    const ret = arg0.length;
    return ret;
};

module.exports.__wbg_new_9163745409122fa8 = function() {
    const ret = new Array();
    return ret;
};

module.exports.__wbg_new_b6f51e9f591d0d1d = function(arg0) {
    const ret = new Uint8Array(arg0);
    return ret;
};

module.exports.__wbg_new_d684b6b3189ca362 = function() {
    const ret = new Object();
    return ret;
};

module.exports.__wbg_next_6a72514087dd23f8 = function(arg0) {
    const ret = arg0.next;
    return ret;
};

module.exports.__wbg_next_96ab50690a8f6cca = function() { return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
}, arguments) };

module.exports.__wbg_set_3807d5f0bfc24aa7 = function(arg0, arg1, arg2) {
    arg0[arg1] = arg2;
};

module.exports.__wbg_set_61aa9ab41a0fb137 = function(arg0, arg1, arg2) {
    arg0[arg1 >>> 0] = arg2;
};

module.exports.__wbg_set_911a2f3ee8dd23b5 = function(arg0, arg1, arg2) {
    arg0.set(arg1, arg2 >>> 0);
};

module.exports.__wbg_value_5af0abb3b2b9f90b = function(arg0) {
    const ret = arg0.value;
    return ret;
};

module.exports.__wbindgen_bigint_from_u128 = function(arg0, arg1) {
    const ret = BigInt.asUintN(64, arg0) << BigInt(64) | BigInt.asUintN(64, arg1);
    return ret;
};

module.exports.__wbindgen_bigint_from_u64 = function(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return ret;
};

module.exports.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
    const v = arg1;
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

module.exports.__wbindgen_boolean_get = function(arg0) {
    const v = arg0;
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

module.exports.__wbindgen_debug_string = function(arg0, arg1) {
    const ret = debugString(arg1);
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbindgen_error_new = function(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return ret;
};

module.exports.__wbindgen_in = function(arg0, arg1) {
    const ret = arg0 in arg1;
    return ret;
};

module.exports.__wbindgen_init_externref_table = function() {
    const table = wasm.__wbindgen_export_4;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
    ;
};

module.exports.__wbindgen_is_bigint = function(arg0) {
    const ret = typeof(arg0) === 'bigint';
    return ret;
};

module.exports.__wbindgen_is_function = function(arg0) {
    const ret = typeof(arg0) === 'function';
    return ret;
};

module.exports.__wbindgen_is_object = function(arg0) {
    const val = arg0;
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

module.exports.__wbindgen_is_string = function(arg0) {
    const ret = typeof(arg0) === 'string';
    return ret;
};

module.exports.__wbindgen_is_undefined = function(arg0) {
    const ret = arg0 === undefined;
    return ret;
};

module.exports.__wbindgen_jsval_eq = function(arg0, arg1) {
    const ret = arg0 === arg1;
    return ret;
};

module.exports.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
    const ret = arg0 == arg1;
    return ret;
};

module.exports.__wbindgen_memory = function() {
    const ret = wasm.memory;
    return ret;
};

module.exports.__wbindgen_number_get = function(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
};

module.exports.__wbindgen_number_new = function(arg0) {
    const ret = arg0;
    return ret;
};

module.exports.__wbindgen_shr = function(arg0, arg1) {
    const ret = arg0 >> arg1;
    return ret;
};

module.exports.__wbindgen_string_get = function(arg0, arg1) {
    const obj = arg1;
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    var len1 = WASM_VECTOR_LEN;
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

module.exports.__wbindgen_string_new = function(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
};

module.exports.__wbindgen_throw = function(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

// Browser-compatible WASM loading
// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' || (typeof globalThis !== 'undefined' && globalThis.window);

if (!isBrowser) {
    // Node.js environment - use fs to read the file synchronously
    try {
        const path = require('path').join(__dirname, 'move_bytecode.wasm');
        const fs = require('fs');
        const bytes = fs.readFileSync(path);
        
        const wasmModule = new WebAssembly.Module(bytes);
        const wasmInstance = new WebAssembly.Instance(wasmModule, imports);
        wasm = wasmInstance.exports;
        module.exports.__wasm = wasm;
        
        wasm.__wbindgen_start();
    } catch (e) {
        console.error('Failed to load WASM in Node.js environment:', e);
        throw e;
    }
} else {
    // Browser environment - WASM needs to be loaded differently
    // We'll provide a function to initialize the WASM asynchronously
    console.warn('Browser environment detected. WASM must be initialized asynchronously.');
    
    // Store the original function definitions
    const originalExports = {
        deserialize: exports.deserialize,
        serialize: exports.serialize,
        update_identifiers: exports.update_identifiers,
        update_constants: exports.update_constants,
        get_constants: exports.get_constants,
        version: exports.version
    };
    
    // Provide an async initialization function
    module.exports.initWasm = async function(wasmBytes) {
        try {
            if (!wasmBytes) {
                throw new Error('WASM bytes must be provided for browser initialization');
            }
            
            const wasmModule = await WebAssembly.compile(wasmBytes);
            const wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
            wasm = wasmInstance.exports;
            module.exports.__wasm = wasm;
            
            wasm.__wbindgen_start();
            
            // Restore the original function exports now that WASM is initialized
            Object.keys(originalExports).forEach(name => {
                if (originalExports[name]) {
                    module.exports[name] = originalExports[name];
                }
            });
            
            return true;
        } catch (e) {
            console.error('Failed to initialize WASM:', e);
            throw e;
        }
    };
    
    // Throw error if trying to use WASM before initialization
    const methodNames = ['deserialize', 'serialize', 'update_identifiers', 'update_constants', 'get_constants'];
    methodNames.forEach(name => {
        module.exports[name] = function() {
            throw new Error(`WASM not initialized. Call initWasm() first in browser environment.`);
        };
    });
}

