"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.needsPasswordInit = needsPasswordInit;
exports.defaultPassword = defaultPassword;
const crypto = __importStar(require("crypto"));
const DEFAULT_PASSWORD = '12345';
function hashPassword(password, salt) {
    const passwordSalt = salt ?? crypto.randomBytes(16).toString('hex');
    const hash = crypto
        .pbkdf2Sync(password, passwordSalt, 1000, 64, 'sha512')
        .toString('hex');
    return { hash, salt: passwordSalt };
}
function verifyPassword(password, storedHash, storedSalt) {
    if (!storedHash || !storedSalt || storedHash === 'hash') {
        return password === DEFAULT_PASSWORD;
    }
    const { hash } = hashPassword(password, storedSalt);
    return hash === storedHash;
}
function needsPasswordInit(hash) {
    return !hash || hash === 'hash' || hash === '';
}
function defaultPassword() {
    return DEFAULT_PASSWORD;
}
//# sourceMappingURL=password.util.js.map