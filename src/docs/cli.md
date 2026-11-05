# Command line

Everything Artifice does is also available from a terminal: adding projects, connecting AI tools, asking for a briefing, and managing memories and playbooks. It's handy for scripts, servers and AI agents that run shell commands.

## Setting it up

The command line comes with the app: the program inside Artifice answers every command. Make a short name for it.

**Mac** (zsh): add this line to `~/.zshrc`, then open a new terminal.

```bash
alias artifice="/Applications/Artifice.app/Contents/MacOS/artifice-desktop"
```

**Windows** (PowerShell): add this line to your profile (`notepad $PROFILE`), then open a new terminal.

```powershell
Set-Alias artifice "$env:LOCALAPPDATA\Artifice\artifice-desktop.exe"
```

If you installed Artifice somewhere else, use that folder instead. Check that it works:

```bash
artifice --version
```

## A first session

```bash
artifice login                         # sign in (once per computer)
artifice init ~/Projects/shop          # add a project
artifice connect claude-code           # connect an AI tool, once for all projects
cd ~/Projects/shop
artifice ask "where do we round invoice totals?"
artifice remember "Invoices round half up; finance decided this in March"
```

Commands use the project you're in: the current folder, or the nearest folder above it that's a project. To name another project, add `-p FOLDER`.

## Global options

| Option | Meaning |
|---|---|
| `-p, --project FOLDER` | The project to use |
| `--json` | Print JSON instead of text, for scripts |
| `--help` | Help for any command, such as `artifice ask --help` |
| `--version` | The version |

A command exits with `0` when it works and `1` when it doesn't, with the reason on stderr.

Every command is described in the [command reference](/docs/cli-reference).
