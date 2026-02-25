const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const Module = require("module");

// Browser shims for Node.js
if (typeof globalThis.navigator === "undefined") {
    globalThis.navigator = { userAgent: "Mozilla/5.0 Chrome/120" };
}
if (typeof globalThis.window === "undefined") {
    globalThis.window = globalThis;
}
if (typeof globalThis.self === "undefined") {
    globalThis.self = globalThis;
}
if (typeof globalThis.document === "undefined") {
    globalThis.document = {
        createElement: () => ({ style: {} }),
        addEventListener: () => { },
        removeEventListener: () => { },
    };
}
if (typeof globalThis.MediaSource === "undefined") {
    globalThis.MediaSource = class {
        static isTypeSupported() { return true; }
    };
}
if (typeof globalThis.crypto === "undefined") {
    globalThis.crypto = crypto.webcrypto;
}

// Patch the module to expose XGSecretKey
const pluginPath = require.resolve("@byteplus/veplayer/plugin/hlsEncrypt.js");

// Don't write to disk on Vercel! It will cause EROFS (Read-only filesystem) error.
// Compile and evaluate the patched module in memory.
let code = fs.readFileSync(pluginPath, "utf8");
code = code.replace(
    "e.XGSecretKey=cg,e.aes4js=Ym,e.util=dv",
    'e.XGSecretKey=cg,e.aes4js=Ym,e.util=dv;if(typeof globalThis!=="undefined"){globalThis.__XGSecretKey=cg}'
);

const m = new Module(pluginPath, module);
m.filename = pluginPath;
m.paths = Module._nodeModulePaths(path.dirname(pluginPath));
m._compile(code, pluginPath);
const XGSecretKey = globalThis.__XGSecretKey;

// Cache: kid → keyString
const keyCache = new Map();

/**
 * Derive AES-128 key from PlayAuth and PlayAuthId (kid).
 * Returns a 16-char UTF-8 string used as AES-128-CBC key.
 */
async function deriveKey(playAuth, kid) {
    if (keyCache.has(kid)) return keyCache.get(kid);

    const xg = new XGSecretKey({
        secretKey: playAuth,
        kid,
        drmType: "private_encrypt",
        vid: "",
        getLicenseUrl: "",
        useUnionInfoDRM: false,
        sessionId: "node-" + Date.now(),
    });

    const result = await xg.getKeyValue();
    const keyStr = result?.clearKeys?.[kid];
    if (!keyStr) throw new Error(`Failed to derive key for kid ${kid}`);

    keyCache.set(kid, keyStr);
    return keyStr;
}

/**
 * Decrypt an AES-128-CBC encrypted buffer using the given key string.
 */
function decryptSegment(encrypted, keyStr) {
    const key = Buffer.from(keyStr, "utf-8");
    const iv = Buffer.alloc(16, 0);
    const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

module.exports = {
    deriveKey,
    decryptSegment,
    keyCache
};
