export const microsoft_package_html : string = `<article class="package" role="listitem">

<div class="row">
    <div class="col-sm-1 hidden-xs hidden-sm">
        <img class="package-icon img-responsive" aria-hidden="true" alt="" src="https://www.nuget.org/Content/gallery/img/default-package-icon-256x256.png" onerror="this.src='https://www.nuget.org/Content/gallery/img/default-package-icon-256x256.png'; this.onerror = null;">
    </div>
    <div class="col-sm-11">
        <div class="package-header">
            <a class="package-title" href="/packages/Selenium.WebDriver/4.0.0-alpha01">Selenium.<wbr>WebDriver</a>



                <span class="package-by">
                    by:
                        <a href="/profiles/selenium" title="View selenium's profile">selenium</a>
                </span>
        </div>

            <div class="package-title">
                Selenium WebDriver
            </div>

        <ul class="package-list">
            <li>
                <span class="icon-text">
                    <i class="ms-Icon ms-Icon--Download" aria-hidden="true"></i>
                    11,147,630 total downloads
                </span>
            </li>
            <li>
                <span class="icon-text">
                    <i class="ms-Icon ms-Icon--History" aria-hidden="true"></i>
                    last updated <span data-datetime="2019-04-19T06:41:49.0500000+00:00" title="2019-04-19T06:41:49Z">7 days ago</span>
                </span>
            </li>
            <li>
                <span class="icon-text">
                    <i class="ms-Icon ms-Icon--Flag" aria-hidden="true"></i>
                    Latest version: <span class="text-nowrap">4.0.0-alpha01 </span>
                </span>
            </li>
                <li class="package-tags">
                    <span class="icon-text">
                        <i class="ms-Icon ms-Icon--Tag" aria-hidden="true"></i>
                            <a href="/packages?q=Tags%3A%22selenium%22" title="Search for selenium">selenium</a>
                            <a href="/packages?q=Tags%3A%22webdriver%22" title="Search for webdriver">webdriver</a>
                            <a href="/packages?q=Tags%3A%22browser%22" title="Search for browser">browser</a>
                            <a href="/packages?q=Tags%3A%22automation%22" title="Search for automation">automation</a>
                    </span>
                </li>
        </ul>

        <div class="package-details">
            Selenium is a set of different software tools each with a different approach
  to supporting browser automation. These tools are highly flexible, allowing
  many options for locating and manipulating elements within a browser, and one
  of its key features is the support for automating...
<a href="/packages/Selenium.WebDriver/4.0.0-alpha01">More information</a>            </div>
    </div>
</div>
</article>`;

export const microsoft_header_html = `<div class="row-heading clearfix">
<div class="cell-heading">
    <h1 role="alert">
                169 packages
            returned for selenium.<wbr>webdriver
    </h1>
</div>
<div class="cell-controls">
    <form action="/packages" method="get">
        <input id="search-term" name="q" type="hidden" value="selenium.webdriver">
        <label>
            <input type="checkbox" id="include-prerelease" checked="">
            Include prerelease
        </label>
    </form>
</div>
</div>`;

export const csproj_file : string = `<Project Sdk="Microsoft.NET.Sdk">

<PropertyGroup>
  <TargetFramework>netcoreapp2.1</TargetFramework>

  <IsPackable>false</IsPackable>
</PropertyGroup>

<ItemGroup>
  <PackageReference Include="nunit" Version="3.10.1" />
  <PackageReference Include="NUnit3TestAdapter" Version="3.10.0" />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="15.8.0" />
  <PackageReference Include="SpecFlow" Version="3.0.199" />
</ItemGroup>

<ItemGroup>
  <ProjectReference Include="..\\PackSharp\\PackSharp.csproj" />
</ItemGroup>

</Project>`;
