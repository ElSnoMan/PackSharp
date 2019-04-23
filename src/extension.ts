// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as fs from 'fs';
import * as vscode from 'vscode';
import axios from 'axios';
const glob = require('glob');
import * as packer from './packer';
import * as packsharp from './packsharp';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('PackSharp activated and running!');

	let add_package_disposable = vscode.commands.registerCommand('extension.packsharp.package.add', async () => {
		let csprojects : packer.CsProject[] = [];

		glob.sync(vscode.workspace.rootPath + '/**/*.csproj', {}).forEach((file: string) => {
			csprojects.push(new packer.CsProject(file));
		});

		let project_pick_input = await vscode.window.showQuickPick(csprojects.map(csproj => csproj.name));

		let search_term_input = await vscode.window.showInputBox(inputBoxOptions);
		let search_term = packsharp.Clean.search(search_term_input);

		if (search_term !== 'invalid') {
			let query = `https://www.nuget.org/packages?q=${search_term}`;
			let response = await axios.get(query);
			let sections = response.data.split(' <');

			let packages : packer.Package[] = packer.getPackages(sections);
			let packagesFoundMessage = packer.getPackagesFoundMessage(sections);

			let package_pick_input = await vscode.window.showQuickPick(packages.map(p => p.name));
		
			packsharp.Terminal.send(`dotnet add ${project_pick_input} package ${package_pick_input}`);
			vscode.window.showInformationMessage(`${packagesFoundMessage}. Visit ${query} for more info`);
		}
	});

	let remove_package_disposable = vscode.commands.registerCommand('extension.packsharp.package.remove', async () => {
		let csprojects : packer.CsProject[] = [];

		glob.sync(vscode.workspace.rootPath + '/**/*.csproj', {}).forEach((file: string) => {
			csprojects.push(new packer.CsProject(file));
		});

		let project_pick_input = await vscode.window.showQuickPick(csprojects.map(csproj => csproj.name));

		let csproj = csprojects.find(p => p.name.includes(project_pick_input));

		let package_pick_input = await vscode.window.showQuickPick(csproj.packages.map(p => p.name));

		packsharp.Terminal.send(`dotnet remove ${project_pick_input} package ${package_pick_input}`);
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
	});

	context.subscriptions.push (
		add_package_disposable,
		remove_package_disposable,
		query_disposable
	);
}

// this method is called when your extension is deactivated
export function deactivate() { console.log('PackSharp deactivated'); }

let inputBoxOptions = {
	'ignoreFocusOut': true,
	'placeHolder': 'Example: newtonsoft',
	'prompt': 'Search for Nuget Packages using a search term.'
};
