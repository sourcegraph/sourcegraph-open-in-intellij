import * as sourcegraph from 'sourcegraph'
import * as path from 'path'

interface Settings {
    'openInIntellij.basePath'?: string
    'openInIntellij.useBuiltin'?: boolean
    'openInIntellij.replacements'?: Record<string, string>
    'openInIntellij.osPaths'?: Record<string, string>
}

function getOpenUrl(textDocumentUri: URL): URL {
    let basePath = sourcegraph.configuration.get<Settings>().value['openInIntellij.basePath']
    let useBuiltin = sourcegraph.configuration.get<Settings>().value['openInIntellij.useBuiltin']
    const osPaths: Record<string, string> = sourcegraph.configuration.get().value['openInIntellij.osPaths'] as Record<string, string>
    const replacements = sourcegraph.configuration.get().value['openInIntellij.replacements'] as Record<string, string>
    const learnMorePath = new URL('/extensions/sourcegraph/open-in-intellij', sourcegraph.internal.sourcegraphURL.href)
        .href
    const userSettingsPath = new URL('/user/settings', sourcegraph.internal.sourcegraphURL.href).href

    // check platform and use assigned path when available;
    if(osPaths){
        if (navigator.userAgent.includes('Win') && osPaths.windows) {
            basePath = osPaths.windows;
            useBuiltin = true;
        } else if (navigator.userAgent.includes('Mac') && osPaths.mac) {
            basePath = osPaths.mac;
        } else if (navigator.userAgent.includes('Linux') && osPaths.linux) {
            basePath = osPaths.linux;
        }
    }
    if (typeof basePath !== 'string') {
        throw new TypeError(
            `Add \`openInIntellij.basePath\` to your [user settings](${userSettingsPath}) to open files in the editor. [Learn more](${learnMorePath})`
        )
    }
    if (!path.isAbsolute(basePath)) {
        throw new Error(
            `\`openInIntellij.basePath\` value \`${basePath}\` is not an absolute path. Please correct the error in your [user settings](${userSettingsPath}).`
        )
    }

    const rawRepoName = decodeURIComponent(textDocumentUri.hostname + textDocumentUri.pathname)
    const repoBaseName = rawRepoName.split('/').pop() ?? ''
    const relativePath = decodeURIComponent(textDocumentUri.hash.slice('#'.length))
    const absolutePath = path.join(basePath, repoBaseName, relativePath)
    let openUrl = !useBuiltin ? 'idea://open?file=' + absolutePath : 'http://localhost:63342/api/file' + absolutePath;

    if (sourcegraph.app.activeWindow?.activeViewComponent?.type === 'CodeEditor') {
        const selection = sourcegraph.app.activeWindow?.activeViewComponent?.selection
        if (selection) {
            openUrl += `:${selection.start.line + 1}`

            if (selection && selection.start.character !== 0) {
                openUrl += `:${selection.start.character + 1}`
            }
        }
    }

    // Run replacements if any
    if(replacements) {
        for (const replacement in replacements) {
            if (typeof replacement === 'string') {
                const POST_REGEX = new RegExp(replacement);
                openUrl = openUrl.replace(POST_REGEX, replacements[replacement])
            }
        }
    }

    return new URL(openUrl)
}

export function activate(context: sourcegraph.ExtensionContext): void {
    context.subscriptions.add(
        sourcegraph.commands.registerCommand('openInIntellij.open.file', async (uri?: string) => {
            if (!uri) {
                const viewer = sourcegraph.app.activeWindow?.activeViewComponent
                uri = viewerUri(viewer)
            }
            if (!uri) {
                throw new Error('No file currently open')
            }
            const openUrl = getOpenUrl(new URL(uri))
            await sourcegraph.commands.executeCommand('open', openUrl.href)
        })
    )
}

function viewerUri(viewer: sourcegraph.ViewComponent | undefined): string | undefined {
    switch (viewer?.type) {
        case 'CodeEditor':
            return viewer.document.uri
        case 'DirectoryViewer':
            return viewer.directory.uri.href
        default:
            return undefined
    }
}
