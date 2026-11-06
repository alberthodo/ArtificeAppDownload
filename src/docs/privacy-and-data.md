# Privacy and your data

## What stays on your computer

These never leave your computer:
- your files and what's in them;
- Artifice's library of them;
- your memories and playbooks;
- the questions your AI asks, unless you turn on examples (below).

Your AI tools get briefings from Artifice on your computer. What they do with them then is up to each tool and its own terms.

## Your account

Your account holds your email and the name you choose.

## Usage numbers

Artifice sends usage numbers to learn what works:
- which features are used, how long things take, and when something fails;
- how well each briefing worked: whether your AI searched again or opened files itself afterwards, whether the task went well, and your rating;
- the kind of computer (memory, processor, operating system) and the mix of file types in a project, in ranges.

They never include your files, file or folder names, or questions. Once you sign in, they're linked to your account, so they can be followed across your computers.

To turn them off, open **Settings › Privacy**, or run:

```bash
artifice privacy off
```

Setting `DO_NOT_TRACK=1` or `ARTIFICE_TELEMETRY=0` in your environment also turns them off.

## Rating briefings

Open a briefing in **Activity** and choose thumbs up or down. Artifice uses it to brief better, and the rating is sent with the usage numbers.

## Examples (off unless you turn them on)

**Settings › Privacy › Help improve Artifice with examples** shares real briefings, so we can see where Artifice gets it wrong. For each briefing it sends:
- your question, with secrets, email addresses, phone and card numbers and your own folder name removed;
- which files and parts the briefing held (their paths and titles), and how much of each;
- what your AI searched for or opened afterwards, and how the task went.

It never sends what's in your files or the text of the briefing. **See an example** shows your latest briefing exactly as it would be sent, and lets you leave a project out. Examples are kept for 90 days.

## For organisations

IT can turn usage numbers or examples off on every computer, with a file people can't override:
- macOS: `/Library/Application Support/Artifice/policy.json`
- Windows: `%ProgramData%\Artifice\policy.json`
- Linux: `/etc/artifice/policy.json`

```json
{ "telemetry": false, "share_examples": false }
```

Either key can be left out. Settings then shows the switch as turned off by your organisation.

For the full details, see the [privacy policy](/privacy).
