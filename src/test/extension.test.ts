//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
// https://code.visualstudio.com/api/working-with-extensions/testing-extension

import * as fs from 'fs';
import * as assert from 'assert';
import axios from 'axios';
import * as packer from '../packer';
import * as packsharp from '../packsharp';
import * as test_object from './test-objects';

suite("Extension Tests", function () {
});

suite('Packer Tests', () => {
    test('convert html to Package', () => {
        let sections = test_object.microsoft_package_html.split(' <');
        let packages : packer.Package[] = packer.getPackages(sections);

        assert.equal(packages.length, 1);
        assert.equal(packages[0].name, 'Selenium.WebDriver');
        assert.equal(packages[0].url, '/packages/Selenium.WebDriver/4.0.0-alpha01');
        assert.equal(packages[0].version, '');
    });

    test('convert .csproj packages to Package', () => {
        let sections = test_object.csproj_file.split(' <');
        let packages : packer.Package[] = packer.getCsprojPackages(sections);

        assert.equal(packages.length, 4);
        assert.equal(packages[0].name, 'nunit');
        assert.equal(packages[0].url, '');
        assert.equal(packages[0].version, '3.10.1');
    });

    test('get Packages Found Message from html', () => {
        let sections = test_object.microsoft_header_html.split(' <');
        let message = packer.getPackagesFoundMessage(sections);

        assert.equal(message.includes('169 packages'), true, message);
        assert.equal(message.includes('returned for selenium.webdriver'), true, message);
    });
});