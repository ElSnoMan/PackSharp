# Change Log

All notable changes to the "packsharp" extension will be documented in this file.

I'll try my best to adhere to [Keeping a Changelog](http://keepachangelog.com/).

## [1.0.0] - 2019-04-28
Initial relsease

### Added
- package.add command
- package.remove command
- package.query command
- project.add command
- project.remove command

## [1.1.0] - 2019-05-06
Bootstrap Selenium command.
This command will:
1. Download and install the necessary Selenium packages to the specified Project (.csproj).
2. Download the latest stable version of chromedriver.zip and extract it to a `_drivers` directory at your workspace root.

This makes getting a Selenium project started is even easier than before!

### Added
- bootstrap.selenium command
- Docstrings
- More test coverage

## [1.2.1] - 2019-05-20
Use Project filepaths instead of just their name.
This eliminates the pathing issues some users were running into.

### Added
- `dotnet` commands will now use the <filepath>.csproj
- Example: `$ dotnet add /Users/Carlos/PackSharp/PackSharp.Tests.csproj package Newtonsoft.Json`
- Instead of: `$ dotnet add PackSharp.Tests package Newtonsoft.Json`

## [1.3.0] - 2019-05-23
New command to add a new template.
Now you can quickly make a Testing Project, ASP.NET Core Project, Solution or WebConfig files, and more!

### Added
- New Palette Command => `PackSharp: Create New Project`
- Uses dotnet's templates to create what you need.

## [2.0.0] - 2019-06-25
New commands to list Packages or References of a selected Project

### Added
- New Palette Command => `PackSharp: List Packages`
- New Palette Command => `PackSharp: List References`

## [2.2.0] - 2019-06-28
Remove a command and cleanup the Windows experience.

## Changes
- Removed `PackSharp: Query Packages` command
- Removed `chmod` command for Windows users since it's not needed
- Update docs to highlight the requirements needed to use all of PackSharp's functionality

## [2.3.0] - 2019-12-12
https://chromedriver.chromium.org changed page structure, so Latest Stable Version detection was updated.

## Changes
- Updated unit tests
- Latest Stable Version detection mechanism updated
- Upgraded a couple packages to resolve security vulnerabilities
