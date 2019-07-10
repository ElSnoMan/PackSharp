import * as vscode from 'vscode';
import { Package } from './packer';

export class Clean {
    /**
     * If undefined or empty, return 'invalid', else return the input string.
     * @param input The input string from the user.
     */
    static input(input: string | undefined) : string {
        if (input === undefined || input === '') {
            vscode.window.showErrorMessage('Input was empty or undefined.');
            return 'invalid';
        }

        return input;
    }
}

/**
 * PackSharp uses its own terminal
 * to isolate commands to a single session.
 */
export class Terminal {
    /**
     * Returns the `packsharp` terminal if it exists, or creates a new terminal.
     * @param preserveFocus When `true`, the terminal will not take focus.
     */
    static get(preserveFocus?: boolean | undefined) : vscode.Terminal {
        let terminal : vscode.Terminal;
        let existing = vscode.window.terminals.find(t => t.name === 'packsharp');

        if (existing === undefined) {
            terminal = vscode.window.createTerminal('packsharp');
        }
        else {
            terminal = existing;
        }

        terminal.show(preserveFocus);
        return terminal;
    }

    /**
     * Send a string command to the `packsharp` terminal.
     * @param text The command to execute in the terminal.
     */
    static send(text: string) : void {
        this.get().sendText(text);
    }

    static printPackages(packages: Package[]) : void {
        let names = packages.map(p => `${p.name}  -->  https://nuget.org${p.url}`);
        let header = 'echo "\n\n\n[PACKAGE_NAME]     -->     [PACKAGE_URL]';
        let separator = '\n----------------------------------------\n';
        let message = `${header}${separator}${names.join('\\n')}"`;
        this.get().sendText(message);
    }

    /**
     * Send `chmod` command to turn the driver text file to an executable.
     * @param driverDirectory The directory that has the driver text file.
     */
    static chmodDriverZip(driverDirectory: string, platform: string) : string {
        if (platform === 'darwin' || platform === 'linux') {
            this.send(`chmod +x ${driverDirectory}/chromedriver`);
            return 'chmod';
        }
        else {
            // do nothing since `chmod` isn't required on Windows
            return 'windows';
        }
    }
}
