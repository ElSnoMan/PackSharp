// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from "axios";
import * as packager from "./packager";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('PackSharp activated and running!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.packsharp', async () => {
		let csproj_input = await vscode.window.showOpenDialog(openDialogOptions);

		let csproj: vscode.Uri;

		if (csproj_input !== undefined) {
			csproj = csproj_input[0];
		}
		else {
			vscode.window.showErrorMessage('.csproj file not selected.');
			return;
		}
		
		let search_term_input = await vscode.window.showInputBox(inputBoxOptions);

		if (search_term_input === undefined || search_term_input === '') {
			console.error("input was undefined or empty");
			vscode.window.showErrorMessage("Input was empty or undefined.");
		}
		else {
			let response = await axios.get("https://www.nuget.org/packages?q=" + search_term_input);
			let sections = response.data.split(' <');

			let packages : packager.Package[] = packager.getPackages(sections);
			let packagesFoundMessage = packager.getPackagesFoundMessage(sections);

			let package_pick_input = await vscode.window.showQuickPick(packages.map(p => p.name));
			let terminal = vscode.window.createTerminal("packsharp");
			terminal.show();
			terminal.sendText("dotnet add PROJECT package " + package_pick_input);

			vscode.window.showInformationMessage(packagesFoundMessage);
			vscode.window.showInformationMessage("Visit https://nuget.org/packages?q=" + search_term_input + " for more information");
		}		
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { console.log("PackSharp deactivated"); }

let openDialogOptions = {
	'canSelectFiles': true,
	'canSelectFolders': false,
	'canSelectMany': false,
	'openLabel': 'Project (.csproj) to Use',
	'filters': {
		"Projects": [ 'csproj' ]
	}
};

let inputBoxOptions = {
	'ignoreFocusOut': true, // keep open, even if focus leaves
	'placeHolder': 'Example: newtonsoft',
	'prompt': 'Search for nugets using a search term.'
};
