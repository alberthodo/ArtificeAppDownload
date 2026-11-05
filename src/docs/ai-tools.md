# Connecting AI tools

Connect each AI tool once, and it works in every project you add. Artifice adds itself to the tool's own settings on your computer; your projects' files aren't changed.

## Tools that work with Artifice

| Tool | After connecting |
|---|---|
| Claude (the app) | Quit and reopen the Claude app |
| Claude Code | Start a new Claude Code session |
| Codex | Start a new Codex session |
| Gemini CLI | Start a new Gemini CLI session |
| Antigravity | Restart Antigravity |
| Cursor | Restart Cursor |
| Windsurf (Devin Desktop) | Restart Windsurf |
| VS Code (Copilot agent mode) | Restart VS Code |

## Connecting

Open **AI tools** in the sidebar. Each tool installed on your computer has a **Connect** button. After connecting, restart the tool or start a new session, as shown in the table above.

From a terminal, run this:

```bash
artifice connect claude-code
```

Running `artifice connect` on its own shows what's connected.

## Using it

Ask your AI about your project as usual, such as "What's our travel policy for hotels?" or "Where do we round invoice totals?". Your AI asks Artifice for a briefing and answers from your files. In Claude Code, briefings arrive with each prompt on their own.

Your AI can also save what it learns to Memory, and run your playbooks.

## Other apps

Any app that supports MCP servers can use Artifice. Open **AI tools › Details** to copy the definition, or run `artifice connect generic`.

## Disconnecting and repairing

- **Disconnect** removes Artifice from that tool only.
- **Repair** appears if a tool points to an old copy of Artifice, for example after moving the app. One click fixes it.
- To remove Artifice from every tool at once, uninstall it properly. See [Updates and uninstalling](/docs/updates-and-uninstalling).

Before changing a tool's settings file, Artifice keeps a copy of it.
