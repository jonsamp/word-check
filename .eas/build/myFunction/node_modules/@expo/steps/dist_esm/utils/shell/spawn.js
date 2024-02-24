import { pipeSpawnOutput } from '@expo/logger';
import spawnAsyncOriginal from '@expo/spawn-async';
// If
// eslint-disable-next-line async-protect/async-suffix
export function spawnAsync(command, args, allOptions = {
    stdio: 'inherit',
    cwd: process.cwd(),
}) {
    const { logger, ...options } = allOptions;
    const promise = spawnAsyncOriginal(command, args, options);
    if (logger && promise.child) {
        pipeSpawnOutput(logger, promise.child, options);
    }
    return promise;
}
//# sourceMappingURL=spawn.js.map