---
name: issue-to-case-study
description: Turn an issue, pull request, commit, log, or test result into a draft Prestige case-study bundle with evidence-backed Performance and Backstage content.
---

# Issue to draft case study

Create or update a case-study bundle under `content/work/<slug>/`. Keep every new page `draft: true` for review. Never publish, deploy, or post the content elsewhere.

## 1. Gather evidence

Read the issue and linked pull requests, commits, logs, and test output. Use available repository or issue tools to verify claims. Record what is known, what changed, the measured outcome, and the source for each claim. If evidence is missing, leave a clear `TODO` in the draft instead of filling the gap.

Do not invent numbers, causes, outcomes, or test results. Distinguish observations from inferences in the prose.

## 2. Create the bundle

Use the Hugo archetype when a site is available:

```bash
hugo new content work/<short-slug>
```

The bundle's `index.md` is the Performance layer. Add `backstage.md` and numbered resources under `steps/` for the process account. Follow the content schemas and step kinds in the Prestige design specification. Do not add ad hoc front-matter fields that the specification does not define.

## 3. Write the two layers

- Performance states the problem and outcome clearly, with measured metrics only when evidence supports them.
- Backstage records the problem, constraints, hypotheses, rejected options, implementation, and result as applicable.
- Pair every headline metric with a result step that explains its measurement and limits.
- Use `{{< stepref >}}` to connect a result claim to its supporting step where useful.
- Keep `draft: true`; preserve unknowns as TODOs.

Write in the portfolio owner's established voice. If no voice is established, use concise, direct language and do not invent a persona.

## 4. Privacy and handoff

Exclude secrets, credentials, customer data, private IPs, and internal hostnames. Redact sensitive log output. Report the bundle path, the evidence used, and unresolved TODOs. Do not claim the theme renders the page until the relevant templates are implemented.
