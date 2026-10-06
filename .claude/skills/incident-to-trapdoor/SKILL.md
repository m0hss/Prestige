---
name: incident-to-trapdoor
description: Create a draft Prestige Trapdoor failure report from verified incident evidence, including impact, cause, cost, and changed behavior.
---

# Incident to draft Trapdoor report

Create or update a standalone page under `content/trapdoor/`. Keep new reports `draft: true`. This workflow records a failure; it does not update a live status page or operate production systems.

## 1. Verify the account

Use the evidence provided or available from the incident record, logs, monitoring, messages, commits, or test output. Record what happened, who or what was affected, the cause if confirmed, the cost if measured, and the behavior that changed afterward.

- Do not guess at causes. If the cause is unresolved, say it is under investigation.
- Do not invent duration, impact, cost, or counts. Leave a TODO when evidence is missing.
- Make clear which conclusions are inferred rather than confirmed.

## 2. Create the report

Use the Hugo archetype when a site is available:

```bash
hugo new content trapdoor/<short-slug>.md
```

Follow the Trapdoor schema in the Prestige design specification: `title`, `date`, optional related case bundle name (`case`), `severity`, `what`, `cause`, `cost`, `changed`, and `lessons`. The reference number is derived by the theme; do not invent or set one. Keep `draft: true` until reviewed.

## 3. Write and check

Write a plain narrative that explains the sequence and points to evidence where possible. Separate confirmed cause from a working theory. Include the corrective behavior and any remaining uncertainty. Use public service names and omit internal hostnames, private IPs, credentials, tokens, and customer data.

Before handing off, check that required fields are present, placeholders are clearly marked, and all claims match the evidence. Report the file path and unresolved TODOs. Do not publish or deploy.
