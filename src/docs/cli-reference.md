# Command reference

Add `--json` to any command for machine-readable output, and `-p FOLDER` to choose the project. Setup is described on [Command line](/docs/cli).

## Account

### `artifice login`
Sign in through your browser. The last page shows a code to paste into the terminal.

### `artifice logout [--everywhere]`
Sign out on this computer, or with `--everywhere`, on every computer. Your projects stay.

### `artifice whoami`
Who is signed in, the plan, and since when.

Commands that work with a project need someone signed in on the computer. Being offline never blocks them.

## Projects

### `artifice init [FOLDER] [--yes]`
Add a folder as a project and read it. Without `FOLDER`, the current folder is used. For very large folders or your home folder, it asks first; `--yes` skips the question.

### `artifice status`
The project's files, memories, playbooks, and whether it's up to date.

### `artifice sync`
Read changes now. The app does this on its own while it's open.

### `artifice watch`
Keep the project up to date while the app is closed, until you press <kbd>Ctrl</kbd> <kbd>C</kbd>.

### `artifice projects [list | remove FOLDER [--delete-library]]`
List your projects, or remove one. `--delete-library` also deletes Artifice's data for it. Your files are never touched.

## Briefings

### `artifice ask QUESTION… [--budget N] [--path FILE]`
Print the briefing your AI would get for `QUESTION`. `--budget` limits its size in tokens. `--path` names the file you're working in.

### `artifice search WORDS…`
Find the most relevant places in the project, one per line, with any matching memories.

### `artifice expand ID`
Show more of an item from a briefing or a search, using the id it shows (`s_…`), or `file:PATH` for a whole file's outline.

### `artifice digest`
What changed since the last digest, and memories that need a look.

## Memory

### `artifice remember TEXT… [--kind fact|decision|open] [--source FILE]…`
Save a memory. `--source` links it to the file it came from, so it's flagged if that file changes.

### `artifice notes [NOTE]`
List your memories by topic, or show one topic.

### `artifice review ID [--retire]`
Mark a flagged memory as still true, or retire it with `--retire`.

### `artifice export [FOLDER]`
Save your memories as Markdown files.

### `artifice log TEXT…`
Add a line to today's activity log.

## Playbooks

### `artifice job add FILE`
Add or update a playbook from a Markdown file.

### `artifice job list`
Your playbooks.

### `artifice job show NAME`
One playbook.

### `artifice job run NAME [--step N] [--input KEY=VALUE]…`
Show a playbook's steps, with the briefing for the current step.

### `artifice job delete NAME`
Remove a playbook.

## AI tools

### `artifice connect [TOOL] [--remove]`
Connect an AI tool once, for all your projects. Without `TOOL`, it shows what's connected. With `--remove`, it disconnects the tool. The tools are:
- `claude-code`
- `claude-desktop`
- `codex`
- `gemini`
- `antigravity`
- `cursor`
- `windsurf`
- `vscode`

`generic` prints a definition for any other MCP app.

### `artifice mcp`
Run Artifice as an MCP server on stdin and stdout, for apps you set up by hand.

### `artifice doctor`
A report for when something isn't working: versions, connections and recent errors. It holds no file contents or questions, so it's safe to share.

## Your AI and savings

### `artifice tokens [info | set MODEL [--billing api|subscription] | count TEXT]`
These commands work with the AI you use most:
- `info` shows which AI that is;
- `set` changes it, and `--billing` says how you pay for it;
- `count` counts the tokens in `TEXT`.

Savings are shown in that AI's tokens and prices.

### `artifice savings [--here]`
What Artifice saved across all your projects, or with `--here`, in this one.

## Privacy

### `artifice privacy [on | off]`
Show what anonymous usage numbers are collected, or turn them on or off.

## Uninstalling

### `artifice uninstall [--delete-data] [--delete-libraries] [--yes]`
Disconnect Artifice from every AI tool before you delete the app. `--delete-data` also deletes Artifice's data on this computer, and `--delete-libraries` deletes each project's library. It asks first unless you add `--yes`.
