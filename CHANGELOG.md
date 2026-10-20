# Artifice changelog

Every change to Artifice, newest first. Artifice updates itself, so you get these changes without doing anything.

## Version 0.1.4 · Next update

Savings you can rely on, connections that just show up, and jobs anyone can write.

### New

- **Savings that stay with you.** Your savings now add up across all your projects in one place, and they are kept even if you remove a project or delete its Artifice folder. Existing savings are brought over automatically.
- **All projects or one.** The Savings page shows every project together, or just the one you have open, with a breakdown by project and by AI tool.
- **Jobs without the code.** Create and edit jobs with a simple form: a name, the steps, and the files or notes each step should use, suggested as you type. Templates fill the form in for you.
- **What’s new in the app.** Click “What’s new” at the bottom of the window to see what changed in your version.
- **Google Antigravity.** Artifice can now connect to Google Antigravity, and finds Windsurf under its new name, Devin Desktop.

### Improved

- **Folders are now projects.** What Artifice called a workspace or folder is now a project, in the app, the command line and the help pages. Old commands keep working.
- **See every connected AI tool.** Artifice now recognises AI tools you connected yourself, including ones set up for a single project or with the tool’s own commands, and shows when each one last used it.
- **Where each tool is set up.** The Connect page shows which settings file connects each tool, flags tools that have Artifice turned off, and lists other apps that use Artifice.
- **More accurate savings.** When your AI is handed the same file twice in one conversation, it counts once. Savings by tool now tell Claude Code apart from Claude Code inside the Claude app.
- **Safer connect and disconnect.** Disconnect now removes Artifice however it was added, and Artifice no longer rewrites a working setup when you update the app.

### Fixed

- The “New job” button did nothing when the list of templates was already showing.
- Removing a project, or deleting its Artifice folder, erased its savings history.
- AI tools connected outside the app (for example with “claude mcp add”) showed as not connected.
- With the same setup added twice, Claude Code could get the same context twice and have it counted twice.
- When two AI tools asked the same question at the same moment, one of them could get an error.
- Renaming a job left the old one behind.
- The Savings page went blank after removing your last project.

## Version 0.1.3 · October 16, 2026

A clearer Overview, a new Graph, savings in money, and connecting AI tools once.

### New

- **A clearer Overview.** See at a glance whether a project is ready, what your AI can use and what is kept private, which AI tools are connected, and what you saved this week.
- **A new Graph.** Explore how your files, sections and notes connect. Search, filter, and focus on one item to see what is around it.
- **Savings in money.** The Savings page leads with what you saved in money and tokens, with the trend week by week and a breakdown by AI tool.
- **Connect once.** Connect an AI tool once and it uses Artifice in every project you add, without changing your project files. A clean-up option removes the setup older versions added to folders.

### Fixed

- Bug fixes and improvements.

## Version 0.1.2 · October 16, 2026

A fix for opening Artifice on Macs.

### Fixed

- On some Macs, Artifice could refuse to open after downloading it.

## Version 0.1.1 · October 16, 2026

The first public release, with downloads, automatic updates and honest savings.

### New

- **Download and updates.** Download Artifice for macOS (Apple Silicon and Intel) and Windows (x64 and ARM). Once installed, it updates itself.
- **Counted in your AI’s tokens.** Tell Artifice which AI you mainly use, and every count, budget and saving is shown in that AI’s tokens, with how exact the count is. Claude users can measure it precisely with their own key.
- **Honest savings.** Savings are shown as a range, from a cautious to a generous estimate, in tokens and money, with every assumption spelled out. If you pay a monthly plan, money is shown as what the same use would cost at API prices.
- **Composer Pro.** An optional AI model that runs on your computer and writes clearer summaries, especially of code. Nothing leaves your computer, and it can use a copy you already have in Ollama.
- **Settings for all projects.** Choose defaults once for every project, and change them for a single project when you need to.
- **Anonymous usage numbers.** Artifice shares anonymous usage numbers to help improve it, never your files, names or questions. You are told the first time, and you can turn it off in Settings.

### Improved

- **A new name.** Carrel is now Artifice.
- **Your library stays private.** The Artifice folder inside each project is kept out of Git, Spotlight search and Dropbox sync.
- **Better summaries.** Model-written summaries are more accurate, and very short sections are left as they are.
- **A cleaner design.** A refreshed look throughout the app.

### Fixed

- Several fixes for Windows.

## Version 0.1.0 · October 14, 2026

The first preview of Artifice.

### New

- **A library for your folders.** Add any folder, empty or full of documents, notes and code. Artifice catalogs it on your computer and keeps it up to date as files change. Secrets and private files are left out.
- **The right context for your AI.** For each task, Artifice hands your AI tools just the parts of your files they need, within a token budget, instead of whole files.
- **A shared notebook.** Facts, decisions and open questions that you and your AI tools save as you work. Artifice files them, merges duplicates and flags contradictions.
- **Jobs.** Repeatable step-by-step work, with the right context prepared for every step.
- **Works with your AI tools.** Connect Claude Code, Cursor, Codex or any app that supports MCP. Claude Code also gets context with every prompt.
- **A desktop app and a command line.** Use Artifice from its app on macOS and Windows, or from the terminal.
