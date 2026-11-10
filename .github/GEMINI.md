# Rules for the coding agent

This is the public repo for edwardasilva.com. Agent rules live in the information submodule, not at the root of this repo. Read `information/.agents/AGENTS.md` and `information/.agents/STYLE.md` before you change anything, and follow them. The rules below are the same ones that apply to every coding agent in this repo.

## Routing

Use the `gemini` label, or comment `@gemini-cli`, for easy tasks: low severity, small, one or two files, docs, wording, config, tests, or polish.

Use the `claude` label, or comment `@claude`, for harder work: medium or high severity, multi-file changes, design, security, workflows, or anything that needs judgment.

Only the repository owner can start either workflow. Both work on a branch and open a pull request. Neither pushes to `main`, merges, tags, or cuts a release.

## Git

- Work on a branch. Never push to `main`.
- Every change reaches `main` through a pull request, and every merge is a squash merge. Only Edward merges.
- When you work from an issue, name it in the pull request body on its own line, as `Part of #N`, and add `Closes #N` when the pull request finishes the issue. Outside contributors do not need an issue link. A short description is enough.
- Keep each pull request to one change.
- Do not create tags. Do not force-push or rewrite pushed history.
- A release is cut only when Edward says so.
- `information/` is the private data submodule (resume-data.json and agent rules). You can read it here but cannot change it. Private data issues live in edwardasilva/information. If the change needs `information/`, say so in your comment.

## Site and writing

- No emoji anywhere: files, commits, pull requests, comments, or output.
- Do not put bot or tool names in repo text or commit messages.
- Keep examples neutral, such as Alex Doe with they and them.
- This repo is all rights reserved, with no MIT and no CC BY. Third-party font and dependency notices keep their own licenses.
- Every file header in this repo ends with `Copyright (c) 2026 Edward Silva. All rights reserved.`

## Checks

Run `npm ci --ignore-scripts`, then `npm run lint` and `npm run build`, before you push.

## Secrets

Never print or commit secrets, tokens, or environment variables.
