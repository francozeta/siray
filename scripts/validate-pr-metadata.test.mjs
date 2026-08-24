import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const validatorPath = fileURLToPath(
  new URL("./validate-pr-metadata.mjs", import.meta.url),
);

function validate({ title, impact, branch, body }) {
  const result = spawnSync(process.execPath, [validatorPath], {
    encoding: "utf8",
    env: {
      ...process.env,
      PR_TITLE: title,
      PR_BODY: body ?? `- [x] ${impact}`,
      PR_HEAD_REF: branch,
    },
  });

  return {
    status: result.status,
    output: `${result.stdout}${result.stderr}`,
  };
}

test("accepts a usable feature as a minor change", () => {
  const result = validate({
    title: "feat(ordering): add shared bar queue",
    impact: "minor",
    branch: "feat/shared-bar-queue",
  });
  assert.equal(result.status, 0, result.output);
});

test("accepts a production fix as a patch change", () => {
  const result = validate({
    title: "fix(access): rotate compromised tag",
    impact: "patch",
    branch: "fix/tag-rotation",
  });
  assert.equal(result.status, 0, result.output);
});

test("accepts an explicit breaking change", () => {
  const result = validate({
    title: "feat(api)!: replace order event contract",
    impact: "breaking",
    branch: "feat/order-event-contract",
  });
  assert.equal(result.status, 0, result.output);
});

test("accepts internal work without a release", () => {
  const result = validate({
    title: "ci(versioning): add release policy",
    impact: "none",
    branch: "ci/release-policy",
  });
  assert.equal(result.status, 0, result.output);
});

test("accepts research without a release", () => {
  const result = validate({
    title: "research(nfc): validate physical tap cue",
    impact: "none",
    branch: "research/nfc-tap-cue",
  });
  assert.equal(result.status, 0, result.output);
});

test("rejects a feature that declares no release", () => {
  const result = validate({
    title: "feat(ui): add pickup mode",
    impact: "none",
    branch: "feat/pickup-mode",
  });
  assert.equal(result.status, 1);
  assert.match(result.output, /requires minor impact/);
});

test("rejects tool-prefixed branches", () => {
  const result = validate({
    title: "ci(versioning): validate release impact",
    impact: "none",
    branch: "bot/release-policy",
  });
  assert.equal(result.status, 1);
  assert.match(result.output, /conventional branch/);
});

test("rejects multiple selected impacts", () => {
  const result = validate({
    title: "fix(access): rotate compromised tag",
    branch: "fix/tag-rotation",
    body: "- [x] patch\n- [x] minor",
  });
  assert.equal(result.status, 1);
  assert.match(result.output, /exactly one release impact/);
});

test("allows Release Please automation", () => {
  const result = validate({
    title: "chore(main): release 0.1.1",
    impact: "none",
    branch: "release-please--branches--main--components--siray",
  });
  assert.equal(result.status, 0, result.output);
});
