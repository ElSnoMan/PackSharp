import * as vscode from 'vscode';
import axios from 'axios';
const glob = require('glob');
import * as packer from './packer';
import * as packsharp from './packsharp';

export async function activate(context: vscode.ExtensionContext) {
	console.log('PackSharp activated!');

	let add_package_disposable = vscode.commands.registerCommand('extension.packsharp.package.add', async () => {
		let csprojects : packer.CsProject[] = [];

		glob.sync(vscode.workspace.rootPath + '/**/*.csproj', {}).forEach((file: string) => {
			csprojects.push(new packer.CsProject(file));
		});

		let project_pick_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to add the Package to'}
		);

		let search_term_input = await vscode.window.showInputBox(inputBoxOptions);
		let search_term = packsharp.Clean.search(search_term_input);

		if (search_term !== 'invalid') {
			let query = `https://www.nuget.org/packages?q=${search_term}`;
			let response = await axios.get(query);
			let sections = response.data.split(' <');

			let packages : packer.Package[] = packer.getPackages(sections);
			let packagesFoundMessage = packer.getPackagesFoundMessage(sections);

			let package_pick_input = await vscode.window.showQuickPick(
				packages.map(p => p.name),
				{ placeHolder: 'The Package to add'}
			);
		
			packsharp.Terminal.send(`dotnet add ${project_pick_input} package ${package_pick_input}`);
			vscode.window.showInformationMessage(`${packagesFoundMessage}. Visit ${query} for more info`);
		}
	});

	let remove_package_disposable = vscode.commands.registerCommand('extension.packsharp.package.remove', async () => {
		let csprojects : packer.CsProject[] = [];

		glob.sync(vscode.workspace.rootPath + '/**/*.csproj', {}).forEach((file: string) => {
			csprojects.push(new packer.CsProject(file));
		});

		let project_target_pick_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to remove the Package from' }
		);

		let csproj = csprojects.find(p => p.name === project_target_pick_input);

		let package_pick_input = await vscode.window.showQuickPick(
			csproj.packages.map(p => p.name),
			{ placeHolder: 'The Package to remove'}
		);

		packsharp.Terminal.send(`dotnet remove ${project_target_pick_input} package ${package_pick_input}`);
	});

	let query_packages_disposable = vscode.commands.registerCommand('extension.packsharp.package.query', async () => {
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

	let add_reference_disposable = vscode.commands.registerCommand('extension.packsharp.reference.add', async () => {
		let csprojects : packer.CsProject[] = [];

		glob.sync(vscode.workspace.rootPath + '/**/*.csproj', {}).forEach((file: string) => {
			csprojects.push(new packer.CsProject(file));
		});

		let project_target_pick_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to add the Reference to'}
		);

		let target_csproj = csprojects.find(p => p.name === project_target_pick_input);

		csprojects = packer.removeCsProjectFromArray(csprojects, target_csproj);

		let project_source_pick_input = await vscode.window.showQuickPick(
			csprojects.map(p => p.name),
			{ placeHolder: 'The Project Reference to add' }
		);

		packsharp.Terminal.send(`dotnet add ${project_target_pick_input} reference ${project_source_pick_input}`);
	});

	let remove_reference_disposable = vscode.commands.registerCommand('extension.packsharp.reference.remove', async () => {
		let csprojects : packer.CsProject[] = [];

		glob.sync(vscode.workspace.rootPath + '/**/*.csproj', {}).forEach((file: string) => {
			csprojects.push(new packer.CsProject(file));
		});

		let project_pick_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to remove the Reference from' }
		);

		let csproj = csprojects.find(p => p.name === project_pick_input);

		let project_ref_to_remove = await vscode.window.showQuickPick(
			csproj.references.map(ref => ref.name),
			{ placeHolder: 'The Project Reference to remove' }
		);

		let reference = csproj.references.find(ref => ref.name === project_ref_to_remove);

		packsharp.Terminal.send(`dotnet remove ${project_pick_input} reference ${reference.filepath}`);
	});

	context.subscriptions.push (
		add_package_disposable,
		remove_package_disposable,
		add_reference_disposable,
		remove_reference_disposable,
		query_packages_disposable
	);
}

// this method is called when your extension is deactivated
export function deactivate() { console.log('PackSharp deactivated'); }

let inputBoxOptions = {
	'ignoreFocusOut': true,
	'placeHolder': 'Example: newtonsoft',
	'prompt': 'Search for Nuget Packages using a search term.'
};
