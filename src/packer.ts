import * as fs from 'fs';

export class CsProject {
	constructor(filepath: string) {
		this._filepath = filepath;
		this._sections = fs.readFileSync(this._filepath).toString().split(' <');
	}

	private _filepath : string;
	private _sections : string[];

	public get filepath() : string {
		return this._filepath;
	}

	public get name() : string {
		let name_match = this._filepath.split('/').pop().match('(.*?).csproj');
		return name_match !== null ? name_match[1] : 'invalid';
	}

	public get packages() : Package[] {
		return getCsprojPackages(this._sections);
	}

	public get references() : ProjectReference[] {
		return getCsprojProjectReferences(this._sections);
	}
}

export class Package {
	// Example: <PackageReference Include="CommandLineParser" Version="1.9.71" />
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

export class ProjectReference {
	// Example: <ProjectReference Include="..\Framework\Framework.csproj" />
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

export function getPackages(sections: string[]) {
	let packages : Package[] = [];

	sections.forEach((section: string) => {
		if (section.includes('a class="package-title"')) {
			let pkg = convertHtmlToPackage(section);
			packages.push(pkg);
		}
	});

	return packages;
}

export function getCsprojPackages(sections: string[]) {
	let packages : Package[] = [];
	
	sections.forEach((section: string) => {
		if (section.includes('PackageReference')) {
			let pkg = convertPackageReferenceToObject(section);
			packages.push(pkg);
		}
	});

	return packages;
}

export function getCsprojProjectReferences(sections: string[]) {
	let references : ProjectReference[] = [];

	sections.forEach((section: string) => {
		if (section.includes('ProjectReference')) {
			let ref = convertProjectReferenceToObject(section);
			references.push(ref);
		}
	});

	return references;
}

export function getPackagesFoundMessage(sections: string[]) {
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].includes('h1 role="alert"')) {
			let section = sections[i].split('">')[1].trim();
			let message = removeWbrTags(section);
			return message;
        }
	}
	
	let failure = 'Packages Found Message not found';
	console.error(failure);
	
    return failure;
}

export function removeCsProjectFromArray(arr: CsProject[], csproject: CsProject) {
    return arr.filter(elem => {
        return elem !== csproject;
    });
}

function convertHtmlToPackage(xml: string) : Package {
	var name_match = xml.match('>(.*?)</a>');
	let packageName = name_match !== null ? removeWbrTags(name_match[1]) : 'error - name not found';
	
	let href_match = xml.match('href="(.*?)"');
	let packageUrl = href_match !== null ? href_match[1] : 'error - href not found';
	
    return new Package(packageName, packageUrl, '');
}

function convertPackageReferenceToObject(xml: string) : Package {
	let name_match = xml.match('Include="(.*?)"');
	let packageName = name_match !== null ? name_match[1] : 'error - name not found';
	
	let version_match = xml.match('Version="(.*?)"');
	let packageVersion = version_match !== null ? version_match[1] : 'error - version not found';
	
    return new Package(packageName, '', packageVersion);
}

function convertProjectReferenceToObject(xml: string) : ProjectReference {
	let filepath_match = xml.match('Include="..\(.*?)"');
	let filepath = filepath_match !== null ? filepath_match[1] : 'error - file path not found.';
	filepath = filepath.substr(1).replace('\\', '/');

	let name_match = filepath.split('/').pop().match('(.*?).csproj');
	let name = name_match !== null ? name_match[1] : 'error - name not found';
	
    return new ProjectReference(filepath, name);
}

function removeWbrTags(str: string) {
	var cleaned_string = str;
	var tagCount = (cleaned_string.match(/\<wbr/g) || []).length;

	while (tagCount > 0) {
		// loop deletion of tags since string.match only finds first occurrence
		cleaned_string = cleaned_string.replace('<wbr>', '');
		tagCount = (cleaned_string.match(/\<wbr\>/g) || []).length;
	}

	return cleaned_string;
}