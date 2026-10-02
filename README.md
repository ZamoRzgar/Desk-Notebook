# Desk Notebook

A note-taking app that looks like a book on your desk. Give each class or
project its own colored tab, then write pages inside it.

Your notes stay on your computer. No account, no cloud, free.

<p align="center">
  <img src="docs/screenshots/light.png" alt="Desk Notebook in light mode" width="49%" />
  <img src="docs/screenshots/dark.png" alt="Desk Notebook in dark mode" width="49%" />
</p>

## Download

Get the latest version from the
[releases page](https://github.com/ZamoRzgar/Desk-Notebook/releases)
(in China, use the [Gitee mirror](https://gitee.com/zamo97/Desk-Notebook)).

| System | File | How to install |
| --- | --- | --- |
| Windows | `Desk-Notebook-Setup-x.y.z.exe` | Run it. If Windows warns you, click "More info", then "Run anyway". |
| Ubuntu, Mint, Debian | `desk-notebook_x.y.z_amd64.deb` | `sudo apt install ./desk-notebook_*_amd64.deb` |
| Other Linux | `Desk-Notebook-x.y.z.AppImage` | `chmod +x` the file, then double-click it. |

The app updates itself. Updates never touch your notes.

## Features

- Colored binder tabs for sections, which you can rename and recolor
- Headings, lists, tables, and four highlight colors
- Code blocks with syntax coloring (use the `</>` button or type three backticks)
- Math: paste `$...$` LaTeX from an AI chat and it shows as a real equation
- Pasting a chat answer keeps its tables, code, and math
- Tags, instant search, and PDF export
- Light and dark mode

## For developers

You need Node.js 22 or newer.

```bash
npm install
npm run dev              # try it in the browser at http://localhost:5173
npm run electron:dev     # run it as a desktop app
npm run dist:linux       # build the AppImage and .deb into release/
```

To publish a new version, run `npm version patch` and
`git push origin main --tags`. GitHub Actions then builds the Windows and
Linux installers into a draft release. Publish the draft and installed apps
update on their next start.

Built with Electron, React, TipTap, and SQLite.
