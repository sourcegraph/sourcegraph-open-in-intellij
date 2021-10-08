# Open in Intellij Sourcegraph extension

Adds a button at the top of files in both Sourcegraph app and code hosts like GitHub (when the Sourcegraph browser extension is installed) that will open the current file in Intellij.

<picture>
<source srcset="https://user-images.githubusercontent.com/37420160/96809054-23450b80-13e8-11eb-8e76-a0556e3b41e6.png" media="(prefers-color-scheme: dark)" />
<source srcset="https://user-images.githubusercontent.com/37420160/96809032-16281c80-13e8-11eb-9b24-3787300ee66f.png" media="(prefers-color-scheme: light)" />
<img src="https://user-images.githubusercontent.com/37420160/96809032-16281c80-13e8-11eb-9b24-3787300ee66f.png" alt="Screenshot" />
</picture>

## Configuration

Please apply the following configurations in your `User Settings` on Sourcegraph:

- `openInIntellij.basePath`: [REQUIRED] The absolute path on your computer where your git repositories live. This extension requires all git repos to be already cloned under this path with their original names. `"/Users/yourusername/src"` is a valid absolute path, while `"~/src"` is not.

- `openInIntellij.onWindows`: [OPTIONAL] Set to `true` if you are using this extension on Windows.

## Configuration for Windows users

The `idea://` protocol handler that this extension is using to open files directly from a URL is currently not supported on Windows. As a workaround, Windows user can use the Intellij's built-in REST API to open files directly from a URL with extra configuration steps.

1. In the Intellij's Settings panel, go to `Build, Execution, Deployment`

1. Click on the `Debugger` tab and mark the box next to `Allow unsigned requests` as checked. This allows requests to be made to the built-in server from outside IntelliJ IDEA as stated in their [docs](https://www.jetbrains.com/help/idea/php-built-in-web-server.html#configuring-built-in-web-server).

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

To open repository files in your user's Documents directory:

```json
{
  "extensions": {
    "sourcegraph/open-in-intellij": true,
  },
  "openInIntellij.basePath": "/C:/Users/USERNAME/Documents/",
  "openInIntellij.useBuiltin": true,
}
```

## Development

1. Run `yarn && yarn run serve` and keep the Parcel bundler process running.
1. [Sideload the extension](https://docs.sourcegraph.com/extensions/authoring/local_development) (at the URL http://localhost:1234 by default) on your Sourcegraph instance or Sourcegraph.com.

When you edit a source file in your editor, Parcel will recompile the extension. Reload the Sourcegraph web page to use the updated extension.