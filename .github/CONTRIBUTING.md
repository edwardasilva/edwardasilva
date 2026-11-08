# Contributing

This page covers how a change gets from an idea to edwardasilva.com. It follows the same system as [eeprep](https://github.com/edwardasilva/eeprep/blob/main/.github/CONTRIBUTING.md).

## Start with an issue

Every change starts as a GitHub issue. Issues are off in this repo, so they live in [eeprep](https://github.com/edwardasilva/eeprep/issues) with an `edwardasilva.com:` title prefix, and on its project board.

## Branches and pull requests

Cut a short branch from `main` and open a pull request back into `main`. Keep each pull request to one change.

The pull request body names its issue on its own line:

```text
Part of edwardasilva/eeprep#244
```

CI fails a pull request when that line is missing. Dependabot is exempt, and so is a pull request labeled `no-epic`. The check runs again when you edit the body or change a label, so no new push is needed.

Show proof in the pull request: the build output, or before-and-after screenshots at desktop width and at 390 px for anything visual.

Every merge is a squash merge, and the branch is deleted when it merges. Do not push straight to `main`.

## Private files

`information/` is a submodule that points at the private repo `edwardasilva/information`. It changes through pull requests too, and its pull request merges first:

1. Edit the files in `information/`.
2. Run `npm run info:save -- "What changed"`. It commits on a new branch in `information/`, pushes it, and opens a pull request there.
3. Squash-merge that pull request.
4. Run `npm run info:pull` here. It moves `information/` to the new `main` and stages the pointer.
5. Commit the pointer on a branch and open a pull request in this repo.

The pre-push hook stops a push that points at an `information/` commit outside its `main` branch, because a squash merge leaves a branch commit out of `main`.

## Checks

Pull requests into `main` run these jobs:

- the body contains `Part of edwardasilva/eeprep#<issue>` (Dependabot and `no-epic` skip this)
- `npm ci` and the production build, with `resume-data.json` from the commit `information/` points at
- `npm run lint`, `npm run typecheck`, and `npm run format`

CI reads the private data with the read-only deploy key in the `INFORMATION_REPO_KEY` secret. Dependabot pull requests can only read Dependabot secrets, so the same key is also saved there.

## Releases and deploys

The site has two targets on Cloudflare Pages:

| Trigger                        | Target                                                       |
| ------------------------------ | ------------------------------------------------------------ |
| A merge to `main`              | The dev site, <https://dev.edwardasilva.pages.dev> (noindex) |
| A version tag such as `v1.0.0` | edwardasilva.com                                             |

A release is one commit with its own version tag. The work merged since the last release is squashed into that commit. The tag deploys it and creates a GitHub release with generated notes. Releases are Edward's call.

To cut release `vX.Y.Z` after `vA.B.C`:

```bash
git switch main
git pull --ff-only
git reset --soft vA.B.C
git commit -m "edwardasilva vX.Y.Z"
git tag vX.Y.Z
git push --force-with-lease origin main
git push origin vX.Y.Z
```

The first release has no earlier tag, so it squashes into the first commit instead. Replace the `reset` and `commit` lines with these two:

```bash
git reset --soft "$(git rev-list --max-parents=0 HEAD)"
git commit --amend -m "edwardasilva v1.0.0"
```

The force push rewrites `main`, so the branch rules on `main` must let Edward bypass them. After a release, rebase any open branch onto the new `main`.

Deploys use the repository secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `INFORMATION_REPO_KEY`.

## Local commands

```bash
npm ci
npm run info:setup
npm run hooks:install
npm run dev
```

`npm run all` runs the lint and format fixes, then the build. `npm run build` needs LuaLaTeX for the resume PDF. Set `SKIP_RESUME_PDF_BUILD=1` and `SKIP_RESUME_GENERATE=1` to build the site with the committed PDF, as CI does.
