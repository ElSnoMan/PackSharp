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
    const response = await axios.get('http://chromedriver.storage.googleapis.com/LATEST_RELEASE');

    if (response.status === 200) {
        return response.data;
    }
    else {
        throw new Error('Could not get the Latest Stable Version. Try installing chromedriver manually.');
    }
}

export function getZipByPlatform(platform: string) : string {
    if (platform === 'darwin')     { return CHROMEDRIVER_ZIP_MAC; }
    else if (platform === 'win32') { return CHROMEDRIVER_ZIP_WIN; }
    else if (platform === 'linux') { return CHROMEDRIVER_ZIP_LINUX; }
    else {
        throw new Error('Platform not supported: ' + process.platform);
    }
}
