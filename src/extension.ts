// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import * as vscode from 'vscode';
import axios from 'axios';
import * as packager from './packager';
import * as packsharp from './packsharp';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('PackSharp activated and running!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let add_disposable = vscode.commands.registerCommand('extension.packsharp', async () => {
		let csproj_input = await vscode.window.showOpenDialog(openDialogOptions);
		let csproj = packsharp.Clean.csproj(csproj_input);
		
		let search_term_input = await vscode.window.showInputBox(inputBoxOptions);
		let search_term = packsharp.Clean.search(search_term_input);

		if (search_term !== 'invalid') {
			let query = `https://www.nuget.org/packages?q=${search_term}`;
			let response = await axios.get(query);
			let sections = response.data.split(' <');

			let packages : packager.Package[] = packager.getPackages(sections);
			let packagesFoundMessage = packager.getPackagesFoundMessage(sections);

			let package_pick_input = await vscode.window.showQuickPick(packages.map(p => p.name));
			packsharp.Terminal.send(`dotnet add ${csproj} package ${package_pick_input}`);

			vscode.window.showInformationMessage(`${packagesFoundMessage}. Visit ${query} for more info`);
		}
	});

	let query_disposable = vscode.commands.registerCommand('extension.packsharp.query', async () => {
		let search_term_input = await vscode.window.showInputBox(inputBoxOptions);
		let search_term = packsharp.Clean.search(search_term_input);

		if (search_term !== 'invalid') {
			let query = `https://www.nuget.org/packages?q=${search_term}`;
			let response = await axios.get(query);
			let sections = response.data.split(' <');

			let packages : packager.Package[] = packager.getPackages(sections);
			let packagesFoundMessage = packager.getPackagesFoundMessage(sections);
			packsharp.Terminal.printPackages(packages);

			vscode.window.showInformationMessage(`${packagesFoundMessage}. Visit ${query} for more info`);
		}
	});

	let remove_disposable = vscode.commands.registerCommand('extension.packsharp.remove', async () => {
		let csproj_input = await vscode.window.showOpenDialog(openDialogOptions);
		let csproj = packsharp.Clean.csproj(csproj_input);

		let file = fs.readFileSync(csproj).toString();
		let sections = file.split(' <');
		let packages : packager.Package[] = packager.getCsprojPackages(sections);

		let package_pick_input = await vscode.window.showQuickPick(packages.map(p => p.name));

		packsharp.Terminal.send(`dotnet remove ${csproj} package ${package_pick_input}`);
	});

	context.subscriptions.push(add_disposable, query_disposable, remove_disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { console.log('PackSharp deactivated'); }

let openDialogOptions = {
	'canSelectFiles': true,
	'canSelectFolders': false,
	'canSelectMany': false,
	'openLabel': '.csproj to Use',
	'filters': {
		"Projects": [ 'csproj' ]
	}
};

let inputBoxOptions = {
	'ignoreFocusOut': true, // keep open, even if focus leaves
	'placeHolder': 'Example: newtonsoft',
	'prompt': 'Search for nugets using a search term.'
};
