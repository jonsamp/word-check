import { platform } from 'os';
import { dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { createRequire } from 'module';
export const createContext = () => {
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
            return dirPath || (dirPath = dirname(filePath));
        },
        get require() {
            return requireContext || (requireContext = createRequire(pathToFileURL(filePath)));
        },
    };
};
const reg = /([^\(\s]+):\d+:\d+\)?$/;
const parseErrorToFileName = (e) => {
    const initiator = e.stack.split('\n')[2];
    let path = initiator.match(reg)[1];
    if (path.indexOf('file://') === 0) {
        path = fileURLToPath(path);
    }
    if (path[0] === '/' && platform() === 'win32') {
        path = path.slice(1);
    }
    return path;
};
