# Memory and playbooks

## Memory

Memory keeps what's worth remembering about a project: facts, decisions and open questions. You and your AI both add to it, and your AI is reminded of what's relevant when it asks about the project.

- **Add one** in the line at the top: "What should your AI always know about *project*?". As you type, Artifice shows whether it's a fact, a decision or a question, and which topic it goes in; click either to change it. Press <kbd>↵</kbd> to save.
- **Point at a memory** to see who saved it, when, and the file it came from. Click it to edit it, move it to another topic, see the passage it came from, or answer it if it's a question.
- **When that file changes,** the memory gets an amber dot and the top of the page says how many need a look. Click that to go through them one at a time: see what the file says now, then **Still true**, **Update** or **Remove**.
- **To save your memories as Markdown,** run `artifice export`.

You can also ask your AI to remember something: "Remember that hotels in Geneva are capped at 260 CHF a night."

## Playbooks

A playbook is work you repeat, written as steps: a weekly update, release notes, reviewing a change. Each step can come with the files it needs, so your AI starts each step already briefed.

- **To add one,** type what you ask your AI to do again and again at the top of Playbooks. Pick a matching template, or press <kbd>↵</kbd> to write your own steps.
- **To run one,** copy the sentence at the top of the playbook and give it to your AI. If it needs something each time, such as the month, fill in the blank first: "Run the Month-end close playbook for October."
- **Each step** is edited in place. **What your AI gets** shows the passages your AI is given for it.
- **Runs** shows when each run happened, which AI ran it, and how far it got.

Playbooks can also be written as Markdown files and added from the [command line](/docs/cli-reference#playbooks) with `artifice job add`.
