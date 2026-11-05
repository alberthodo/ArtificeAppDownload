# Updates and uninstalling

## Updates

Artifice checks for updates on its own. When one is ready, a line at the bottom of the sidebar offers to install it and restart. You can also check in **Settings › Updates**. What changed in each version is in the [changelog](/changelog).

## Uninstalling

Artifice adds itself to your AI tools' settings. Uninstalling it properly takes it out of them first, so no tool is left trying to start a program that's gone. Your own files are never touched.

**Mac:** open **Settings › Uninstall…**. You can choose to also delete Artifice's data, such as savings history and settings, and the library in each project. Then drag Artifice to the Trash.

Dragging Artifice straight to the Trash works too. A small helper notices that it's gone and disconnects your AI tools.

**Windows:** uninstall Artifice the usual way, from **Settings › Apps**, or click **Uninstall…** in Artifice's Settings. The uninstaller disconnects your AI tools first.

**Command line:** run this, then delete the app:

```bash
artifice uninstall
```

`--delete-data` and `--delete-libraries` also delete Artifice's data and each project's library.

Settings files shared with a team, such as a committed `.mcp.json`, are listed for you to remove yourself rather than changed.

Uninstalling doesn't delete your account. To delete it, use **Account › Delete account…** first.
