const title = process.env.PR_TITLE?.trim() ?? "";
const body = process.env.PR_BODY ?? "";
const branch = process.env.PR_HEAD_REF?.trim() ?? "";

const automatedBranchPrefixes = [
  "dependabot/",
  "renovate/",
  "release-please--",
];

if (automatedBranchPrefixes.some((prefix) => branch.startsWith(prefix))) {
  console.log(`Accepted automated pull request: ${branch}`);
  process.exit(0);
}

const failures = [];
const branchPattern =
  /^(feat|fix|hotfix|refactor|perf|docs|test|build|ci|chore|research|pilot|release)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!branchPattern.test(branch)) {
  failures.push(
    "Use a conventional branch such as feat/order-queue, fix/tag-resolver, or ci/release-policy.",
  );
}

const titlePattern =
  /^(feat|fix|perf|refactor|docs|test|build|ci|chore|revert|research|pilot)(?:\(([a-z0-9]+(?:-[a-z0-9]+)*)\))?(!)?: (.+)$/;
const titleMatch = title.match(titlePattern);

if (!titleMatch) {
  failures.push(
    "Use a Conventional Commit title: type(scope): short description.",
  );
} else {
  const subject = titleMatch[4];
  if (title.length > 100) {
    failures.push("Keep the pull request title at 100 characters or fewer.");
  }
  if (subject.endsWith(".")) {
    failures.push("Do not end the pull request title with a period.");
  }
}

const selectedImpacts = [
  ...body.matchAll(/^\s*-\s*\[[xX]\]\s+(none|patch|minor|breaking)\b/gm),
].map((match) => match[1]);

if (selectedImpacts.length !== 1) {
  failures.push(
    "Select exactly one release impact in the pull request template: none, patch, minor, or breaking.",
  );
}

if (titleMatch && selectedImpacts.length === 1) {
  const [, type, , breaking] = titleMatch;
  const expectedImpact = breaking
    ? "breaking"
    : type === "feat"
      ? "minor"
      : type === "fix"
        ? "patch"
        : "none";
  const selectedImpact = selectedImpacts[0];

  if (selectedImpact !== expectedImpact) {
    failures.push(
      `The ${type}${breaking ?? ""} title requires ${expectedImpact} impact, but ${selectedImpact} was selected.`,
    );
  }
}

if (failures.length > 0) {
  console.error("Pull request metadata does not satisfy the release policy:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Valid pull request: ${title} (${selectedImpacts[0]})`);
