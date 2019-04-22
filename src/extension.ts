// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import * as vscode from 'vscode';
import axios from 'axios';
import * as packer from './packer';
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

			let packages : packer.Package[] = packer.getPackages(sections);
			let packagesFoundMessage = packer.getPackagesFoundMessage(sections);

			let package_pick_input = await vscode.window.showQuickPick(packages.map(p => p.name));
			packsharp.Terminal.send(`dotnet add ${csproj} package ${package_pick_input}`);

			vscode.window.showInformationMessage(`${packagesFoundMessage}. Visit ${query} for more info`);
		}
		else {
			vscode.window.showErrorMessage('Package Search was invalid.');
		}
	});

	let add_name_disposable = vscode.commands.registerCommand('extension.packsharp.addName', async () => {
		let project_name_input = await vscode.window.showInputBox({
			'ignoreFocusOut': true,
			'placeHolder': 'Project Name',
			'prompt': 'Enter the project name you want to add the package to.'
		});
		let project_name = packsharp.Clean.search(project_name_input);
		
		let search_term_input = await vscode.window.showInputBox(inputBoxOptions);
		let search_term = packsharp.Clean.search(search_term_input);

		if (project_name !== 'invalid' || search_term !== 'invalid') {
			let query = `https://www.nuget.org/packages?q=${search_term}`;
			let response = await axios.get(query);
			let sections = response.data.split(' <');

			let packages : packer.Package[] = packer.getPackages(sections);
			let packagesFoundMessage = packer.getPackagesFoundMessage(sections);

			let package_pick_input = await vscode.window.showQuickPick(packages.map(p => p.name));
			packsharp.Terminal.send(`dotnet add ${project_name} package ${package_pick_input}`);

			vscode.window.showInformationMessage(`${packagesFoundMessage}. Visit ${query} for more info`);
		}
		else {
			vscode.window.showErrorMessage('Project Name or Package Search was invalid.');
		}
	});

	let query_disposable = vscode.commands.registerCommand('extension.packsharp.query', async () => {
		let search_term_input = await vscode.window.showInputBox(inputBoxOptions);
		let search_term = packsharp.Clean.search(search_term_input);

		if (search_term !== 'invalid') {
			let query = `https://www.nuget.org/packages?q=${search_term}`;
			let response = await axios.get(query);
			let sections = response.data.split(' <');

			let packages : packer.Package[] = packer.getPackages(sections);
			let packagesFoundMessage = packer.getPackagesFoundMessage(sections);
			packsharp.Terminal.printPackages(packages);

			vscode.window.showInformationMessage(`${packagesFoundMessage}. Visit ${query} for more info`);
		}
		else {
			vscode.window.showErrorMessage('Package Search was invalid.');
		}
	});

	let remove_disposable = vscode.commands.registerCommand('extension.packsharp.remove', async () => {
		let csproj_input = await vscode.window.showOpenDialog(openDialogOptions);
		let csproj = packsharp.Clean.csproj(csproj_input);

		let file = fs.readFileSync(csproj).toString();
		let sections = file.split(' <');
		let packages : packer.Package[] = packer.getCsprojPackages(sections);

		let package_pick_input = await vscode.window.showQuickPick(packages.map(p => p.name));

		packsharp.Terminal.send(`dotnet remove ${csproj} package ${package_pick_input}`);
	});

	let remove_name_disposable = vscode.commands.registerCommand('extension.packsharp.removeName', async () => {
		let csproj_input = await vscode.window.showOpenDialog(openDialogOptions);
		let csproj = packsharp.Clean.csproj(csproj_input);

		let file = fs.readFileSync(csproj).toString();
		let sections = file.split(' <');
		let packages : packer.Package[] = packer.getCsprojPackages(sections);

		let package_pick_input = await vscode.window.showQuickPick(packages.map(p => p.name));

		packsharp.Terminal.send(`dotnet remove ${csproj} package ${package_pick_input}`);
	});

	context.subscriptions.push (
		add_disposable,
		add_name_disposable,
		query_disposable,
		remove_disposable,
		remove_name_disposable
	);
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
