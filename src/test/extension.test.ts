//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
// https://code.visualstudio.com/api/working-with-extensions/testing-extension

import axios from 'axios';
import * as zipper from 'adm-zip';

import * as packer from '../packer';
import * as packsharp from '../packsharp';
import * as selenium from '../selenium';

import * as test_object from './test-objects';
import * as assert from 'assert';


suite('PackSharp', () => {
    suite('packsharp.Terminal', () => {
        test('get packsharp terminal', () => {
            let terminal = packsharp.Terminal.get();
            assert.equal('packsharp', terminal.name);
        });
    });
    suite('packsharp.Clean.search', () => {
        test('clean undefined search term', () => {
            assert.equal('invalid', packsharp.Clean.input(undefined));
        });

        test('clean empty search term', () => {
            assert.equal('invalid', packsharp.Clean.input(''));
        });

        test('clean valid search term', () => {
            assert.equal('mocha', packsharp.Clean.input('mocha'));
        });
    });
});

suite('Packer', () => {
    suite('html conversions', () => {
        test('convert html packages to Package[]', () => {
            let html = test_object.microsoft_package_html;
            let packages : packer.Package[] = packer.getPackages(html);

            assert.equal(packages.length, 1);
            assert.equal(packages[0].name, 'Selenium.WebDriver');
            assert.equal(packages[0].url, '/packages/Selenium.WebDriver/4.0.0-alpha01');
            assert.equal(packages[0].version, '');
        });

        test('convert html header to Packages Found Message', () => {
            let html = test_object.microsoft_header_html;
            let message = packer.getPackagesFoundMessage(html);

            assert.equal(message.includes('169 packages'), true, message);
            assert.equal(message.includes('returned for selenium.webdriver'), true, message);
        });
    });

    suite('.csproj conversions', () => {
        test('convert .csproj packages to Package[]', () => {
            let xml = test_object.csproj_file;
            let packages = packer.getCsprojPackages(xml);

            assert.equal(packages.length, 4);
            assert.equal(packages[0].name, 'nunit');
            assert.equal(packages[0].url, '');
            assert.equal(packages[0].version, '3.10.1');
        });

        test('convert .csproj projects to ProjectReference[]', () => {
            let xml = test_object.csproj_file;
            let projects = packer.getCsprojProjectReferences(xml);
            let reference = projects[0];

            assert.equal(projects.length, 1);
            assert.equal(reference.name, 'PackSharp');
            assert.equal(reference.filepath, 'PackSharp/PackSharp.csproj');
        });
    });

    suite('helper functions', () => {
        test('remove <wbr> tags', () => {
            let str = 'PackSharp.<wbr>Tests';
            let cleaned_string = packer.removeWbrTags(str);
            assert.equal(cleaned_string, 'PackSharp.Tests');
        });
    });
});

suite("Selenium", async () => {
    test('download chromedriver.zip and extract', async () => {
        let version = await selenium.getLatestStableReleaseVersion();
        let zip_name = selenium.CHROMEDRIVER_ZIP_MAC;
        let download_url = `${selenium.CHROMEDRIVER_ENDPOINT}/${version}/${zip_name}`;

        let response = await axios.request({
            url: download_url,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        let zip = new zipper(response.data);
        zip.extractAllTo('/users/carlos/downloads/');

        // chmod to turn text file to unix executable // doesn't work on Windows
        return packsharp.Terminal.send(`chmod +x /users/carlos/downloads/chromedriver`);
    });

    test('get chromedriver latest stable version', async () => {
        let version = await selenium.getLatestStableReleaseVersion();
        assert.equal(version, '78.0.3904.70');
    });

    test('get chromedriver based on Mac OS platform', () => {
        let platform_zip = selenium.getZipByPlatform(process.platform);
        assert.equal(process.platform, 'darwin');
        assert.equal(platform_zip, selenium.CHROMEDRIVER_ZIP_MAC);
    });

    test('get chromedriver based on Windows platform', () => {
        let platform = 'win32';
        let platform_zip = selenium.getZipByPlatform(platform);
        assert.equal(platform_zip, selenium.CHROMEDRIVER_ZIP_WIN);
        assert.equal(packsharp.Terminal.chmodDriverZip('', platform), 'windows');
    });

    test('get chromedriver based on Linux platform', () => {
        let platform = 'linux';
        let platform_zip = selenium.getZipByPlatform(platform);
        assert.equal(platform_zip, selenium.CHROMEDRIVER_ZIP_LINUX);
    });
});
