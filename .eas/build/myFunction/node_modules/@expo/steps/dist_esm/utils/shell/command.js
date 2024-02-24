import os from 'os';
// stolen from https://circleci.com/docs/configuration-reference/
const DEFAULT_SHELL = '/bin/bash -eo pipefail';
const SHELL_BY_PLATFORM = {
    darwin: '/bin/bash --login -eo pipefail',
};
export function getDefaultShell(platform = os.platform()) {
    const platformSpecificShell = SHELL_BY_PLATFORM[platform];
    if (platformSpecificShell) {
        return platformSpecificShell;
    }
    else {
        return DEFAULT_SHELL;
    }
}
export function getShellCommandAndArgs(shell, script) {
    const splits = shell.split(' ');
    const command = splits[0];
    const args = [...splits.slice(1)];
    if (script) {
        args.push(script);
    }
    return {
        command,
        args,
    };
}
//# sourceMappingURL=command.js.map