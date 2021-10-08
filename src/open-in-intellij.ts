import * as sourcegraph from 'sourcegraph'
import * as path from 'path'

interface Settings {
    'openInIntellij.basePath'?: string
}

function getOpenUrl(textDocumentUri: URL): URL {
    const basePath = sourcegraph.configuration.get<Settings>().value['openInIntellij.basePath']
    const useBuiltin = sourcegraph.configuration.get<Settings>().value['openInIntellij.basePath']
    const learnMorePath = new URL('/extensions/sourcegraph/open-in-intellij', sourcegraph.internal.sourcegraphURL.href)
        .href
    const userSettingsPath = new URL('/user/settings', sourcegraph.internal.sourcegraphURL.href).href

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
    const openUrl = !useBuiltin ? new URL('idea://open?file=' + absolutePath) : new URL('http://localhost:63342/api/file' + absolutePath);

    if (sourcegraph.app.activeWindow?.activeViewComponent?.type === 'CodeEditor') {
        const selection = sourcegraph.app.activeWindow?.activeViewComponent?.selection
        if (selection) {
            openUrl.searchParams.set('line', (selection.start.line + 1).toString())

            if (selection && selection.start.character !== 0) {
                openUrl.searchParams.set('column', (selection.start.character + 1).toString())
            }
        }
    }

    return openUrl
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
