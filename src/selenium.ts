import * as zipper from 'adm-zip';
import axios from 'axios';
var JSSoup = require('jssoup').default;


export const CHROMEDRIVER_ENDPOINT : string = 'https://chromedriver.storage.googleapis.com';
export const CHROMEDRIVER_ZIP_LINUX : string = 'chromedriver_linux64.zip';
export const CHROMEDRIVER_ZIP_MAC : string = 'chromedriver_mac64.zip';
export const CHROMEDRIVER_ZIP_WIN : string = 'chromedriver_win32.zip';

/**
 * Downloads the latest stable version of chromedriver to the specified directory.
 * @param directory The location to extract the chromedriver to.
 */
export async function downloadChromeTo(directory: string, platform: string) : Promise<string> {
    let version = await getLatestStableReleaseVersion();
    let zip_name = getZipByPlatform(platform);
    // Finished download url example:
    // 'https://chromedriver.storage.googleapis.com/74.0.3729.6/chromedriver_mac64.zip';
    let download_url = `${CHROMEDRIVER_ENDPOINT}/${version}/${zip_name}`;

    let response = await axios.request({
        url: download_url,
        method: 'GET',
        responseType: 'arraybuffer'
    });

    let zip = new zipper(response.data);
    zip.extractAllTo(directory);

    return version;
}

export async function getLatestStableReleaseVersion() : Promise<string> {
    let response = await axios.get('http://chromedriver.chromium.org/');
    let soup = new JSSoup(response.data);
    let spans : any[] = soup.findAll('span');
    let version : string;

    spans.forEach((span) => {
        // Find element text of "Latest stable release: ChromeDriver 78.0.3904.70"
        // and return only version of "78.0.3904.70"
        if (span.text.includes("Latest stable")) {
            let anchor = span.nextSibling.nextSibling;
            let split = anchor.text.split(" ");
            version = split.pop();
        }
    });

    return version;
}

export function getZipByPlatform(platform: string) : string {
    if (platform === 'darwin')     { return CHROMEDRIVER_ZIP_MAC; }
    else if (platform === 'win32') { return CHROMEDRIVER_ZIP_WIN; }
    else if (platform === 'linux') { return CHROMEDRIVER_ZIP_LINUX; }
    else {
        throw new Error('Platform not supported: ' + process.platform);
    }
}
