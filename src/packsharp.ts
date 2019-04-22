import * as vscode from 'vscode';
import { Package } from './packager';

export class Clean {
    static csproj(csproj: vscode.Uri[] | undefined) {
        if (csproj !== undefined) {
			return csproj[0].fsPath;
		}
		else {
			vscode.window.showErrorMessage('.csproj file not selected.');
			return 'PROJECT';
        }
    }

    static search(term: string | undefined) {
        if (term === undefined || term === '') {
            vscode.window.showErrorMessage('Input was empty or undefined.');
            return 'invalid';
        }
        
        return term;
    }
}

export class Terminal {
    static get(preserveFocus?: boolean | undefined) {
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

    static printPackages(packages: Package[]) {
        let names = packages.map(p => `${p.name}  -->  https://nuget.org${p.url}`);
        let header = 'echo "\n\n\n[PACKAGE_NAME]     -->     [PACKAGE_URL]';
        let separator = '\n----------------------------------------\n';
        let message = `${header}${separator}${names.join('\\n')}"`;
        this.get().sendText(message);
    }

    static send(text: string) {
        this.get().sendText(text);
    }
}
