"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BIN_PATH = void 0;
const path_1 = __importDefault(require("path"));
const this_file_1 = require("this-file");
const ctx = (0, this_file_1.createContext)();
exports.BIN_PATH = path_1.default.join(ctx.dirname, '../../../bin');
//# sourceMappingURL=bin.js.map