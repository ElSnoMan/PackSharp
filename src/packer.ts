import { workspace } from 'vscode';
import * as fs from 'fs';
const glob = require('glob');
var JSSoup = require('jssoup').default;

/**
 * Gets the `.csproj` files that are in the current workspace.
 * @returns An array of the found CsProjects.
 */
export function getWorkspaceCsProjects() : CsProject[] {
	let csprojects : CsProject[] = [];

	glob.sync(workspace.rootPath + '/**/*.csproj', {}).forEach((file: string) => {
		csprojects.push(new CsProject(file));
	});

	return csprojects;
}

/**
 * Gets the `.sln` files that are in the current workspace.
 * @returns An array of the found Solutions.
 */
export function getWorkspaceSolutions() : Solution[] {
	let solutions : Solution[] = [];

	glob.sync(workspace.rootPath + '/**/*.csproj', {}).forEach((file: string) => {
		solutions.push(new Solution(file));
	});

	return solutions;
}

/**
 * Representation of a `.csproj` file and its contents.
 */
export class CsProject {
	constructor(filepath: string) {
		this._filepath = filepath;
		this._xml = fs.readFileSync(this._filepath).toString();
	}

	private _filepath : string;
	private _xml : string;

	public get filepath() : string {
		return this._filepath;
	}

	public get name() : string {
		let name_match = this._filepath.split('/').pop().match('(.*?).csproj');
		return name_match !== null ? name_match[1] : 'invalid';
	}

	public get packages() : Package[] {
		return getCsprojPackages(this._xml);
	}

	public get references() : ProjectReference[] {
		return getCsprojProjectReferences(this._xml);
	}
}

/**
 * Representatin of a `.sln` file.
 */
export class Solution {
	constructor(filepath: string) {
		this._filepath = filepath;
	}

	private _filepath : string;

	public get filepath() : string {
		return this._filepath;
	}

	public get name() : string {
		let name_match = this._filepath.split('/').pop().match('(.*?).sln');
		return name_match !== null ? name_match[1] : 'invalid';
	}
}

/**
 * Representation of a `Package`.
 * @example from `.csproj`: <PackageReference Include="CommandLineParser" Version="1.9.71" />
 * @example from `HTML`: <a class="package-title" href="/packages/selenium">Selenium.<wbr>WebDriver</a>
 */
export class Package {
	constructor(name: string, url: string = '', version: string = '') {
		this._name = name;
		this._url = url;
		this._version = version;
	}

	private _name : string;
	private _url  : string;
	private _version : string;

	public get name() : string {
		return this._name;
	}

	public get url() : string {
		return this._url;
	}

	public get version() : string {
		return this._version;
	}
}

/**
 * Representation of a `ProjectReference`.
 * @example <ProjectReference Include="..\Framework\Framework.csproj" />
 */
export class ProjectReference {
	constructor(filepath: string = null, name: string = null) {
		this._filepath = filepath;
		this._name = name;
	}

	private _filepath : string;
	private _name : string;

	public get filepath() : string {
		return this._filepath;
	}

	public get name() : string {
		return this._name;
	}
}

/**
 * Get the `Package` objects from an `HTML` string.
 * @param html The `HTML` string to parse the Packages from.
 */
export function getPackages(html: string) : Package[] {
	// Example from HTML: <a class="package-title" href="/packages/selenium">Selenium.<wbr>WebDriver</a>
	let soup = new JSSoup(html);
	let a_elements = soup.findAll('a');
	let packages : Package[] = [];

	a_elements.forEach((tag: any) => {
		if (tag.attrs.class === 'package-title') {
			let name = removeWbrTags(tag.text);
			let url = tag.attrs.href;
			packages.push(new Package(name, url));
		}
	});

	return packages;
}

/**
 * Get the "x Packages Found" header message from an `HTML` string.
 * @param html The `HTML` string to parse the Found Message from.
 */
export function getPackagesFoundMessage(html: string) : string {
	let soup = new JSSoup(html);
	let header = soup.find("h1");
	return header.text;
}

/**
 * Get the `PackageReference` objects from a `.csproj` file.
 * @param xml The `.csproj` file as an `XML` string.
 */
export function getCsprojPackages(xml: string) : Package[] {
	// Example from .csproj file: <PackageReference Include="CommandLineParser" Version="1.9.71" />
	let soup = new JSSoup(xml);
	let references = soup.findAll('PackageReference');
	let packages : Package[] = [];

	references.forEach((tag: any) => {
		let name = tag.attrs.Include;
		let version = tag.attrs.Version;
		packages.push(new Package(name, '', version));
	});

	return packages;
}

/**
 * Get the `ProjectReference` objects from a `.csproj` file.
 * @param xml The `.csproj` file as an `XML` string.
 */
export function getCsprojProjectReferences(xml: string) : ProjectReference[] {
	// Example: <ProjectReference Include="..\Framework\Framework.csproj" />
	let soup = new JSSoup(xml);
	let references = soup.findAll('ProjectReference');
	let project_references : ProjectReference[] = [];

	references.forEach((tag: any) => {
		let filepath = tag.attrs.Include.substr(3);
		filepath = filepath.replace('\\', '/');

		let name_match = filepath.split('/').pop().match('(.*?).csproj');
		let name = name_match !== null ? name_match[1] : 'error - name not found';
		project_references.push(new ProjectReference(filepath, name));
	});

	return project_references;
}

/**
 * Remove the specified `CsProject` from the array.
 * @param arr The array of `CsProject`.
 * @param csproject The `CsProject` to remove from the array.
 */
export function removeCsProjectFromArray(arr: CsProject[], csproject: CsProject) : CsProject[] {
    return arr.filter(elem => {
        return elem !== csproject;
    });
}

/**
 * Remove all `<wbr>` tags from a string.
 * This "cleaning" is required to parse the string to `XML` correctly.
 * @param str The string to remove the `<wbr>` tags from.
 */
export function removeWbrTags(str: string) : string {
	var cleaned_string = str;
	var tagCount = (cleaned_string.match(/\<wbr/g) || []).length;

	while (tagCount > 0) {
		// loop deletion of tags since string.match only finds first occurrence
		cleaned_string = cleaned_string.replace('<wbr>', '');
		tagCount = (cleaned_string.match(/\<wbr\>/g) || []).length;
	}

	return cleaned_string;
}

export const projectTemplates = [
	{
		'template': 'Console Application',
		'shortName': 'console',
		'tag': 'Common/Console'
	},
	{
		'template': 'Class Library',
		'shortName': 'classlib',
		'tag': 'Common/Console'
	},
	{
		'template': 'Unit Test Project',
		'shortName': 'mstest',
		'tag': 'Test/MSTest'
	},
	{
		'template': 'NUnit 3 Test Project',
		'shortName': 'nunit',
		'tag': 'Test/NUnit'
	},
	{
		'template': 'xUnit Test Project',
		'shortName': 'xunit',
		'tag': 'Test/xUnit'
	},
	{
		'template': 'Razor Page',
		'shortName': 'page',
		'tag': 'Web/ASP.NET'
	},
	{
		'template': 'MVC ViewImports',
		'shortName': 'viewimports',
		'tag': 'Web/ASP.NET'
	},
	{
		'template': 'MVC ViewStart',
		'shortName': 'viewstart',
		'tag': 'Web/ASP.NET'
	},
	{
		'template': 'ASP.NET Core Empty',
		'shortName': 'web',
		'tag': 'Web/Empty'
	},
	{
		'template': 'ASP.NET Core Web App (MVC)',
		'shortName': 'mvc',
		'tag': 'Web/MVC'
	},
	{
		'template': 'ASP.NET Core Web App',
		'shortName': 'webapp, razor',
		'tag': 'Web/MVC/Razor Pages'
	},
	{
		'template': 'Class Library',
		'shortName': 'classlib',
		'tag': 'Common/Console'
	},
	{
		'template': 'ASP.NET Core with Angular',
		'shortName': 'angular',
		'tag': 'Web/MVC/SPA'
	},
	{
		'template': 'ASP.NET Core with React.js',
		'shortName': 'react',
		'tag': 'Web/MVC/SPA'
	},
	{
		'template': 'ASP.NET Core with React.js and Redux',
		'shortName': 'reactredux',
		'tag': 'Web/MVC/SPA'
	},
	{
		'template': 'Razor Class Library',
		'shortName': 'razorclasslib',
		'tag': 'Web/Razor/Library/Razor Class Library'
	},
	{
		'template': 'ASP.NET Core Web API',
		'shortName': 'webapi',
		'tag': 'Web/WebAPI'
	},
	{
		'template': 'global.json file',
		'shortName': 'globaljson',
		'tag': 'Config'
	},
	{
		'template': 'NuGet Config',
		'shortName': 'nugetconfig',
		'tag': 'Config'
	},
	{
		'template': 'Web Config',
		'shortName': 'webconfig',
		'tag': 'Config'
	},
	{
		'template': 'Solution File',
		'shortName': 'sln',
		'tag': 'Solution'
	}
];
