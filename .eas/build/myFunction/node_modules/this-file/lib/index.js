"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const os_1 = require("os");
const path_1 = require("path");
const url_1 = require("url");
const module_1 = require("module");
const createContext = () => {
    let filePath, dirPath, requireContext;
    try {
        throw new Error();
    }
    catch (e) {
        filePath = parseErrorToFileName(e);
    }
    return {
        filename: filePath,
        get dirname() {
            return dirPath || (dirPath = path_1.dirname(filePath));
        },
        get require() {
            return requireContext || (requireContext = module_1.createRequire(url_1.pathToFileURL(filePath)));
        },
    };
};
exports.createContext = createContext;
const reg = /([^\(\s]+):\d+:\d+\)?$/;
const parseErrorToFileName = (e) => {
    const initiator = e.stack.split('\n')[2];
    let path = initiator.match(reg)[1];
    if (path.indexOf('file://') === 0) {
        path = url_1.fileURLToPath(path);
    }
    if (path[0] === '/' && os_1.platform() === 'win32') {
        path = path.slice(1);
    }
    return path;
};
