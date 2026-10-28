# Artifice changelog

Every change to Artifice, newest first. Artifice updates itself, so you get these changes without doing anything.

## Version 0.1.6 · Next update

Artifice now spends your tokens only where it saves them.

### New

- **Quiet when your AI is coding.** When you ask your AI to fix, add or change something, Artifice adds nothing to the conversation. In our tests, coding agents found the right place on their own in a few steps, and even being handed the exact lines to change didn't make them cheaper, so anything Artifice added was extra cost. Artifice tells a question from everything else with a small model that runs on your computer in about 30 milliseconds, without asking any AI. It understands what you mean rather than looking for words, so "ok, go on", "why did you do that?", debugging and writing get nothing, and questions get the code. In our tests it was right 9 times in 10 on realistic conversations, and sent a quarter as many unneeded packs as matching words did.
- **The code for your questions.** When you ask how something works, where something is handled, or why the code does what it does, Claude Code gets the exact code to answer from: the relevant functions in full, and for classes, a map of their attributes and methods. In our tests on questions about real projects, Claude answered in fewer steps and at a lower cost, with answers about as good as before.

### Improved

- **Lighter in Claude Code.** Artifice no longer adds a "since your last session" note to every Claude Code session (you can turn it back on), its tools aren't loaded into every conversation, and Claude Code sees five of them with two sentences of instructions instead of twelve.
- **Packs your AI can rely on.** Every pack tells your AI what Artifice did (searched every file, from an index synced just now) and how to use it, worded for every AI tool.
- **Sharper packs for code.** When your AI asks Artifice for context on a code change, source code comes ahead of docs, tests, changelogs and examples, unless you ask about those, and the pack lists where the names in your request appear.

### Changed

- **Savings, as measured.** The Savings page now counts what we measured instead of estimating each pack: every question Artifice answers for your AI counts the saving of an answered question in our benchmark (about 4% of the question's cost in Claude Code, about a third of a cent with Claude Sonnet 5.5). Requests to change code count nothing, because Artifice adds nothing to them. Cursor, Codex, Gemini and other tools use the figure measured in Claude Code for now, and the page says so. Savings from earlier versions stay as they were.
- **Composer Pro is paused** while we build a better version. Projects that used Composer Pro switch to Composer when you update and keep the summaries it already wrote. If you downloaded its model, Settings → Composer Pro → Remove frees the space (about 2.5 GB).

### Fixed

- **"Database is locked" when several AI tools used Artifice at once.** After a big change to a project (switching git branches, a large pull, a big first catalog), requests from Claude, ChatGPT, Gemini and other tools could fail with "database is locked" or wait minutes. Requests now never wait behind each other: a big change is synced in the background while your AI keeps getting answers, and Artifice's database is written in small steps.
- The Overview and Savings pages showed "Loading…" every time you opened them. They now show right away and update in place.
- Running `artifice-desktop` with an option before the command (for example `-p folder summarize`) opened the app in the background instead of running the command.

## Version 0.1.5 · October 22, 2026

Antigravity and Gemini CLI on Windows fixed, and a clean way to uninstall.

### Improved

- **Antigravity, told apart.** Artifice now finds Antigravity however it’s set up (the agent app, the IDE, the command line or a single project), and files its requests under Antigravity, not Gemini CLI.
- **Uninstall cleanly.** Settings → Uninstall disconnects Artifice from every AI tool before you delete it, and can delete its data too. On Windows the uninstaller does this for you. On a Mac you can also just drag Artifice to the Trash: a small helper notices and disconnects your AI tools, and connects them again if you put Artifice back.
- **A report for when something’s off.** `artifice doctor` shows each tool’s setup, which tools have used Artifice and how often, and a log of recent sessions, ready to paste into a bug report.

### Fixed

- On Windows, connecting Gemini CLI could fail with “not valid JSON” when its settings file had comments or was saved with a byte-order mark. Artifice now reads these and keeps your comments when it connects.
- Antigravity could show as Gemini CLI, and its requests weren’t recorded, so no savings appeared. Antigravity is now recognised, and its requests count toward your project.
- Connecting an AI tool could leave Windows paths in a form some tools can’t start.
- The Savings page asked you to connect an AI tool even when one was already connected. It now says what’s connected and what to do next.

## Version 0.1.4 · October 20, 2026

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
