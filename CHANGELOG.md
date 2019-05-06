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
