# Release and versioning policy

Last updated: 2026-08-24

## Decision

SIRAY uses Release Please rather than Changesets.

shadcn/ui uses Changesets because it publishes several npm packages independently. SIRAY is currently one private deployable application, and the owner's other active projects already use Release Please. Release Please gives SIRAY one reviewed version, one changelog, one tag, and one GitHub Release without introducing package-publication mechanics.

## Version calculation

| Merged squash title | Example | Result |
| --- | --- | --- |
| `fix(scope): ...` | `fix(access): rotate compromised tag` | patch |
| `feat(scope): ...` | `feat(ordering): add shared bar queue` | minor |
| `type(scope)!: ...` | `feat(api)!: replace order event contract` | major |
| other allowed types | `research(nfc): validate physical cue` | no release |

Only `feat` and `fix` appear as normal changelog sections. An explicit `!` marks an incompatibility. Research, pilots, documentation, CI, tests, refactors, performance work, and chores do not force a release.

## Human control

The automation opens the release pull request as a draft. It does not decide that a version is ready to ship. A maintainer must review:

- the proposed SemVer number;
- every public changelog entry;
- database or operational migration notes;
- rollout and rollback requirements;
- compatibility with active pilots and locations.

Only merging that reviewed release pull request creates a tag and GitHub Release.

## Repository requirements

- Pull requests target `main`.
- Product changes use squash merge so the reviewed pull request title becomes the release commit.
- GitHub Actions may create pull requests with the repository `GITHUB_TOKEN`.
- The versioning workflow runs only after the `CI` workflow succeeds on a push to `main`.
- Workflow permissions are declared explicitly; the release job receives only `contents`, `issues`, and `pull-requests` write access.
- Third-party actions are pinned to audited commit SHAs.

## Manual recovery

If the versioning workflow does not run:

1. Verify that the `CI` run for the `main` commit completed successfully.
2. Verify the repository setting that allows GitHub Actions to create pull requests.
3. Run the `Versioning` workflow manually from `main`.
4. Review action logs before retrying; do not create tags manually while a release pull request is open.

## Primary references

- [Release Please](https://github.com/googleapis/release-please)
- [Release Please GitHub Action](https://github.com/googleapis/release-please-action)
- [GitHub Actions workflow permissions](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions)
- [shadcn/ui releasing process](https://github.com/shadcn-ui/ui/blob/main/RELEASING.md)
- [Changesets](https://github.com/changesets/changesets)
