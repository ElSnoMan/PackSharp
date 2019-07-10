import * as vscode from 'vscode';
import axios from 'axios';
import * as packer from './packer';
import * as packsharp from './packsharp';
import * as selenium from './selenium';
import { platform } from 'os';


export async function activate(context: vscode.ExtensionContext) {
	let add_package_disposable = vscode.commands.registerCommand('extension.packsharp.package.add', async () => {
		let csprojects : packer.CsProject[] = packer.getWorkspaceCsProjects();
		let project_target_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to add the Package to' , ignoreFocusOut: true }
		);

		let csproj = csprojects.find(p => p.name === project_target_input);

		let search_term_input = await vscode.window.showInputBox(inputBoxOptions);
		let search_term = packsharp.Clean.input(search_term_input);

		if (search_term !== 'invalid') {
			let query = `https://www.nuget.org/packages?q=${search_term}`;
			let response = await axios.get(query);
			let html = response.data;

			let packages : packer.Package[] = packer.getPackages(html);

			let package_target_input = await vscode.window.showQuickPick(
				packages.map(p => p.name),
				{ placeHolder: 'The Package to add', ignoreFocusOut: true }
			);

			if (csproj !== undefined) {
				packsharp.Terminal.send(`dotnet add ${csproj.filepath} package ${package_target_input}`);
			}
			else {
				vscode.window.showErrorMessage("A Project was not selected. Could not add " + package_target_input);
			}
		}
	});

	let remove_package_disposable = vscode.commands.registerCommand('extension.packsharp.package.remove', async () => {
		let csprojects = packer.getWorkspaceCsProjects();
		let project_target_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to remove the Package from', ignoreFocusOut: true }
		);

		let csproj = csprojects.find(p => p.name === project_target_input);

		if (csproj !== undefined) {
			let package_pick_input = await vscode.window.showQuickPick(
				csproj.packages.map(p => p.name),
				{ placeHolder: 'The Package to remove', ignoreFocusOut: true }
			);

			packsharp.Terminal.send(`dotnet remove ${csproj.filepath} package ${package_pick_input}`);
		}
		else {
			vscode.window.showErrorMessage("A Project was not selected.");
		}

	});

	let list_packages_disposable = vscode.commands.registerCommand('extension.packsharp.package.list', async () => {
		let csprojects = packer.getWorkspaceCsProjects();
		let project_target_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to list the Packages from', ignoreFocusOut: true }
		);

		let csproj = csprojects.find(p => p.name === project_target_input);

		if (csproj !== undefined) {
			packsharp.Terminal.send(`dotnet list ${csproj.filepath} package`);
		}
		else {
			vscode.window.showErrorMessage("A Project was not selected.");
		}
	});

	let add_reference_disposable = vscode.commands.registerCommand('extension.packsharp.reference.add', async () => {
		let csprojects = packer.getWorkspaceCsProjects();
		let project_target_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to add the Reference to', ignoreFocusOut: true }
		);

		let csproj = csprojects.find(p => p.name === project_target_input);

		if (csproj !== undefined) {
			csprojects = packer.removeCsProjectFromArray(csprojects, csproj);

			let project_source_input = await vscode.window.showQuickPick(
				csprojects.map(p => p.name),
				{ placeHolder: 'The Project Reference to add', ignoreFocusOut: true }
			);

			packsharp.Terminal.send(`dotnet add ${csproj.filepath} reference ${project_source_input}`);
		}
		else {
			vscode.window.showErrorMessage("A Project was not selected.");
		}
	});

	let remove_reference_disposable = vscode.commands.registerCommand('extension.packsharp.reference.remove', async () => {
		let csprojects = packer.getWorkspaceCsProjects();
		let project_target_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to remove the Reference from', ignoreFocusOut: true }
		);

		let csproj = csprojects.find(p => p.name === project_target_input);

		if (csproj !== undefined) {
			let project_ref_to_remove = await vscode.window.showQuickPick(
				csproj.references.map(ref => ref.name),
				{ placeHolder: 'The Project Reference to remove', ignoreFocusOut: true }
			);

			let reference = csproj.references.find(ref => ref.name === project_ref_to_remove);

			packsharp.Terminal.send(`dotnet remove ${csproj.filepath} reference ${reference.filepath}`);
		}
		else {
			vscode.window.showErrorMessage("A Project was not selected.");
		}
	});

	let list_references_disposable = vscode.commands.registerCommand('extension.packsharp.reference.list', async () => {
		let csprojects = packer.getWorkspaceCsProjects();
		let project_target_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to list the References from', ignoreFocusOut: true }
		);

		let csproj = csprojects.find(p => p.name === project_target_input);

		if (csproj !== undefined) {
			packsharp.Terminal.send(`dotnet list ${csproj.filepath} reference`);
		}
		else {
			vscode.window.showErrorMessage("A Project was not selected.");
		}
	});

	let bootstrap_selenium_disposable = vscode.commands.registerCommand('extension.packsharp.bootstrap.selenium', async () => {
		let csprojects = packer.getWorkspaceCsProjects();
		let project_target_input = await vscode.window.showQuickPick(
			csprojects.map(csproj => csproj.name),
			{ placeHolder: 'The Project to add Selenium to', ignoreFocusOut: true }
		);

		let csproj = csprojects.find(p => p.name === project_target_input);

		if (csproj !== undefined) {
			packsharp.Terminal.send(`dotnet add ${csproj.filepath} package Selenium.WebDriver`);
			packsharp.Terminal.send(`dotnet add ${csproj.filepath} package Selenium.Support`);

			let driver_directory = vscode.workspace.rootPath + '/_drivers';
			let version_downloaded = await selenium.downloadChromeTo(driver_directory, process.platform);

			vscode.window.showInformationMessage(
				`Chromedriver (v${version_downloaded}) was installed in the "/_drivers" directory`
			);

			packsharp.Terminal.chmodDriverZip(driver_directory, process.platform);
		}
		else {
			vscode.window.showErrorMessage("A Project was not selected.");
		}
	});

	let new_template_disposable = vscode.commands.registerCommand('extension.packsharp.template.new', async () => {
		let template_target_input = await vscode.window.showQuickPick(
			packer.projectTemplates.map(pt => pt.template),
			{ placeHolder: 'Select the Project Template', matchOnDescription: true, ignoreFocusOut: true }
		);

		let project_name_input = await vscode.window.showInputBox({
			placeHolder: 'Example: PackSharp',
			prompt: 'Enter the name you want to give the Project/Template',
			ignoreFocusOut: true
		});

		let template = packer.projectTemplates.find(pt => pt.template === template_target_input);
		let project_name = packsharp.Clean.input(project_name_input);

		if (template !== undefined) {
			if (project_name !== 'invalid') {
				packsharp.Terminal.send(`dotnet new ${template.shortName} --name ${project_name}`);
			}
			else {
				packsharp.Terminal.send(`dotnet new ${template.shortName}`);
			}
		}
		else {
			vscode.window.showErrorMessage("A Template was not selected.");
		}
	});

	context.subscriptions.push (
		add_package_disposable,
		remove_package_disposable,
		list_packages_disposable,
		add_reference_disposable,
		remove_reference_disposable,
		list_references_disposable,
		bootstrap_selenium_disposable,
		new_template_disposable
	);
}

// this method is called when your extension is deactivated
export function deactivate() { console.log('PackSharp deactivated'); }

let inputBoxOptions = {
	'ignoreFocusOut': true,
	'placeHolder': 'Example: newtonsoft',
	'prompt': 'Search for Nuget Packages using a search term.'
};
