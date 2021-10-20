# Open in Intellij Sourcegraph extension

Adds a button to the Sourcegraph's extension panel and at the top of files in code hosts like GitHub (when the Sourcegraph browser extension is installed) that will open the current file in Intellij.

<picture>
<source srcset="https://user-images.githubusercontent.com/37420160/96809054-23450b80-13e8-11eb-8e76-a0556e3b41e6.png" media="(prefers-color-scheme: dark)" />
<source srcset="https://user-images.githubusercontent.com/37420160/96809032-16281c80-13e8-11eb-9b24-3787300ee66f.png" media="(prefers-color-scheme: light)" />
<img src="https://user-images.githubusercontent.com/37420160/96809032-16281c80-13e8-11eb-9b24-3787300ee66f.png" alt="Screenshot" />
</picture>

## Configuration

Please apply the following configurations in your `User Settings` on Sourcegraph:

- `openInIntellij.basePath`: [REQUIRED] The absolute path on your computer where your git repositories live. This extension requires all git repos to be already cloned under this path with their original names, which the final path can later be altered using the `openInIntellij.replacements` option.
  - Note: `"/Users/yourusername/src"` is a valid absolute path, while `"~/src"` is not.

- `openInIntellij.useBuiltin`: [OPTIONAL] Set to `true` if you would like to open files using the Intellij's built-in REST API, or if you are using this extension on Windows.

- `openInIntellij.replacements`: [OPTIONAL] Set to an object that includes pairs of strings, where each key will be replaced by its value in the final url. The key can be a string or a RegExp, and the value must be a string. For example, using `"openInIntellij.replacements": {"(?<=Documents\/)(.*[\\\/])": "sourcegraph-$1"}` will add `sourcegraph-` in front of the string that matches the `(?<=Documents\/)(.*[\\\/])` RegExp pattern, while `"openInIntellij.replacements": {"sourcegraph-": ""}` will remove `sourcegraph-` from the final URL.

- `openInIntellij.osPaths`: [OPTIONAL] Takes object. The extension uses the assigned path for the detected Operating System when available. If no platform is detected then we will keep using the basePath provided with `openInIntellij.basePath`. 
  - Note: Currently support `"windows"`, `"mac"`, and `"linux"` as keys.

## Configuration for Windows users

The `idea://` protocol handler that this extension is using to open files directly from a URL is currently not supported on Windows. As a workaround, Windows user can use the Intellij's built-in REST API to open files directly from a URL with extra configuration steps.

1. In the Intellij's Settings panel, go to `Build, Execution, Deployment`

1. Click on the `Debugger` tab and mark the box next to `Allow unsigned requests` as checked. This allows requests to be made to the built-in server from outside IntelliJ IDEA as stated in their [docs](https://www.jetbrains.com/help/idea/php-built-in-web-server.html#configuring-built-in-web-server)

1. **Intellij must be remained open for this workaround to work.**

## Examples

### Mac

To open repository files in your Documents directory:

```json
{
  "extensions": {
    "sourcegraph/open-in-intellij": true,
  },
  "openInIntellij.basePath": "/Users/USERNAME/Documents/"
}
```

### Windows

To open repository files in your user's IdeaProjects directory:

```json
{
  "extensions": {
    "sourcegraph/open-in-intellij": true,
  },
  "openInIntellij.basePath": "/C:/Users/USERNAME/IdeaProjects/",
  "openInIntellij.useBuiltin": true,
}
```

### Set basePath for multiple platforms

Uses the assigned path for the detected Operating System when available:

```json
{
  "extensions": {
    "sourcegraph/open-in-intellij": true,
  },
  "openInIntellij.osPaths": {
    // useBuiltin will automatically be set to true for windows
    "windows": "/C:/Users/USERNAME/folder/",
    "mac": "/Users/USERNAME/folder/",
    "linux": "/home/USERNAME/folder/"
  },
  // set basePath as fallback path when no operation system is detected
  "openInIntellij.basePath": "/Users/USERNAME/Documents/"
}
```

## Development

1. Run `yarn && yarn run serve` and keep the Parcel bundler process running
1. [Sideload the extension](https://docs.sourcegraph.com/extensions/authoring/local_development) (at the URL http://localhost:1234 by default) on your Sourcegraph instance or Sourcegraph.com

When you edit a source file in your editor, Parcel will recompile the extension. Reload the Sourcegraph web page to use the updated extension.