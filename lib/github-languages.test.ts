import { describe, expect, it } from "vitest";
import { parseGithubRepoPath } from "./github-languages";

describe("parseGithubRepoPath", () => {
  it("parses standard HTTPS repo URLs", () => {
    expect(parseGithubRepoPath("https://github.com/octocat/Hello-World")).toEqual({
      owner: "octocat",
      repo: "Hello-World",
    });
  });

  it("strips .git suffix", () => {
    expect(parseGithubRepoPath("https://github.com/octocat/Hello-World.git")).toEqual({
      owner: "octocat",
      repo: "Hello-World",
    });
  });

  it("returns null for non-GitHub URLs", () => {
    expect(parseGithubRepoPath("https://gitlab.com/a/b")).toBeNull();
    expect(parseGithubRepoPath(null)).toBeNull();
  });
});
