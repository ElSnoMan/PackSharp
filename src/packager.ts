
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

	// for (let i = 0; i < sections.length; i++) {
	// 	const section = sections[i];
	// 	if (section.includes('ProjectReference')) {
	// 		//
	// 	}
	// }

	sections.forEach((section: string) => {
		if (section.includes('PackageReference')) {
			let pkg = convertPackageReferenceToPackage(section);
			packages.push(pkg);
		}
	});

	return packages;
}

export function getPackagesFoundMessage(sections: string[]) {
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].includes('h1 role="alert"')) {
            var message = sections[i].split('>');
            return removeWbrTags(message[1]);
        }
	}
	
	let failure = 'Packages Found Message not found';
	console.error(failure);
	
    return failure;
}

export class Package {
	/**
	 * Simple representation of the packages returned by our query
	 */
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

function convertHtmlToPackage(xml: string) {
	var name_match = xml.match('>(.*?)</a>');
	let packageName = name_match !== null ? removeWbrTags(name_match[1]) : 'name not found';
	
	let href_match = xml.match('href="(.*?)"');
	let packageUrl = href_match !== null ? href_match[1] : 'href not found';
	
    return new Package(packageName, packageUrl, '');
}

function convertPackageReferenceToPackage(xml: string) {
	let name_match = xml.match('Include="(.*?)"');
	let packageName = name_match !== null ? name_match[1] : 'name not found';
	
	let version_match = xml.match('Version="(.*?)"');
	let packageVersion = version_match !== null ? version_match[1] : 'version not found';
	
    return new Package(packageName, '', packageVersion);
}

function removeWbrTags(str: string) {
	var cleaned_string = str;
	var tagCount = (cleaned_string.match(/\<wbr\>/g) || []).length;

	while (tagCount > 0) {
        // loop deletion of tags since string.match only finds first occurrence
		cleaned_string = cleaned_string.replace('<wbr>', '');
		tagCount = (cleaned_string.match(/\<wbr\>/g) || []).length;
	}

	return cleaned_string;
}