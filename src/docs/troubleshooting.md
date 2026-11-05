# Troubleshooting

| What you see | What to do |
|---|---|
| Your Mac says Artifice "can't be opened" | Open **System Settings › Privacy & Security** and click **Open Anyway** next to Artifice. |
| Windows says "Windows protected your PC" | Click **More info**, then **Run anyway**. |
| Your AI doesn't seem to use Artifice | Check **AI tools**: the tool should say *connected*. Then restart it or start a new session. In a chat app, mention the project by name. |
| An AI tool says **Needs repair** | Click **Repair**. This happens when Artifice was moved or updated from another folder. |
| "A settings file can't be read" | The message names the file and the line. Fix that line in a text editor, then connect again. Artifice never changes a file it can't read. |
| A file isn't in Library | Open **Library › files aren't read** to see why. Common reasons are a secret-like name or content, a dependency or build folder, `.gitignore`, or a file that's too large or password-protected. |
| The project says **Can't find the folder** | The folder moved or was renamed. Click **Locate…** and pick its new place, or remove the project. |
| Sign-in doesn't return to Artifice | Wait a moment for the code on the sign-in page, then choose **Paste a code** in Artifice. |
| "Sign in to use Artifice" in your AI tool | Nobody is signed in on this computer. Open Artifice and sign in, or run `artifice login`. |
| After deleting Artifice, a tool shows a failed "artifice" server | Remove that server in the tool, or reinstall Artifice and uninstall it from Settings. |

## Still stuck?

Run this in a terminal:

```bash
artifice doctor
```

It prints a report you can share: versions, your AI tools' connections and recent errors. It holds no file contents or questions. Send it with your question to [alberthododesign@gmail.com](mailto:alberthododesign@gmail.com).
