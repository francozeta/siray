# Contributing to SIRAY

SIRAY uses conventional branches, squash merges, and Release Please. The final pull request title becomes the squash commit that determines whether a product release is prepared.

Customer-facing product copy is written in Spanish. Repository documentation, code comments, contribution guidance, and release notes are written in English.

## Branch names

Use a prefix that describes the work and a short kebab-case name:

- `feat/shared-bar-queue`
- `fix/tag-rotation`
- `refactor/menu-resolver`
- `ci/release-policy`
- `research/nfc-tap-cue`
- `pilot/counter-service`

Do not use a person's name, tool, or coding agent as the branch prefix.

## Pull request titles

Format: `type(scope): short description`.

| Type | Use it for | Release impact |
| --- | --- | --- |
| `feat` | A new usable capability for a guest, staff member, or manager | minor |
| `fix` | A correction to observable production behavior | patch |
| `type!` | An explicitly approved incompatibility | breaking |
| `perf`, `refactor` | Internal improvement without a new capability | none |
| `research`, `pilot` | Discovery or operational validation without a shipped capability | none |
| `docs`, `test`, `build`, `ci`, `chore` | Work that does not change the delivered product | none |

`feat` does not mean “many files”, “important”, or “large”. It means a usable product capability, and it produces a minor release, not a major release. A major release requires the explicit `!` marker and human approval of the draft release pull request.

Examples:

- `feat(ordering): add shared bar queue`
- `fix(access): rotate compromised tag`
- `refactor(menu): separate catalog from assignments`
- `ci(versioning): validate release impact`

## Release flow

1. The pull request template declares exactly one impact: `none`, `patch`, `minor`, or `breaking`.
2. CI verifies branch name, title, declared impact, lint, types, tests, and build.
3. The pull request is squash-merged into `main`.
4. Release Please accumulates only publishable `feat`, `fix`, and explicit breaking commits.
5. It opens or updates a draft release pull request.
6. A maintainer reviews the proposed version and changelog.
7. Merging the release pull request updates the version and changelog and creates the `vX.Y.Z` tag and GitHub Release.

Work with `none` impact can merge without forcing a product version. Starting from `0.1.0`, a patch becomes `0.1.1`, a feature becomes `0.2.0`, and an explicitly approved breaking change becomes the next major version proposed by Release Please.
