
export function convertToPackage(xml: string) {
    let packageName = getNameFromXmlString(xml);
    let packageUrl = getHrefFromXmlString(xml);
    return new Package(packageName, packageUrl);
}

export function getPackages(sections: string[]) {
	let packages : Package[] = [];

	sections.forEach((section: string) => {
		if (section.includes('a class="package-title"')) {
			let pkg = convertToPackage(section);
			packages.push(pkg);
		}
	});

	console.log('\n[PACKAGE_NAME]     -->     [PACKAGE_URL]');
	console.log('----------------------------------------');
	packages.forEach(pkg => {
		console.log(pkg.name + '  -->  ' + pkg.url);
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
	constructor(name: string, url: string) {
		this._name = name;
		this._url = url;
	}
	
	private _name : string;
	private _url  : string;

	public get name() : string {
		return this._name;
	}

	public get url() : string {
		return this._url;
	}
}

function getHrefFromXmlString(xml: string) {
    var href_match = xml.match('href="(.*?)"');
    return href_match !== null ? href_match[1] : "href not found";
}

function getNameFromXmlString(xml: string) {
    var name_match = xml.match('>(.*?)</a>');
    return name_match !== null ? removeWbrTags(name_match[1]) : "name not found";
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