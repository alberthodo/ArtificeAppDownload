# Memory and playbooks

## Memory

Memory keeps what's worth remembering about a project: facts, decisions and open questions. You and your AI both add to it, and your AI is reminded of what's relevant when it asks about the project.

- **Add a memory…** at the top of Memory. Choose Fact, Decision or Question, and optionally **Comes from…** a file. Press <kbd>⌘</kbd> <kbd>↵</kbd> to save.
- **Each memory** shows who saved it, when, and the file it came from.
- **When that file changes,** the memory is flagged **Needs a look**, with **See the change**, **Still true** and **Remove**.
- **Export…** saves your memories as Markdown files.

You can also ask your AI to remember something: "Remember that hotels in Geneva are capped at 260 CHF a night."

## Playbooks

A playbook is work you repeat, written as steps: a weekly update, release notes, reviewing a change. Each step can come with the files it needs, so your AI starts each step already briefed.

- **New playbook** offers templates, or a blank playbook with:
  - a name;
  - what it produces;
  - what it needs each time;
  - the steps;
  - when it's done.
- **To run one,** copy the sentence at the top of the playbook ("Run the Weekly update playbook.") and give it to your AI.
- **Each step** shows what your AI will be given, and the playbook's history.

Playbooks can also be written as Markdown files and added from the [command line](/docs/cli-reference#playbooks) with `artifice job add`.
