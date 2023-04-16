import { Octokit } from "@octokit/core";

// or: import { Octokit } from "@octokit/core";
// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
  auth: "YOUR-TOKEN",
});

octokit.request("POST /repos/{owner}/{repo}/pulls/{pull_number}/comments", {
  owner: "OWNER",
  repo: "REPO",
  pull_number: 12,
  body: "Great stuff!",
  commit_id: "6dcb09b5b57875f334f61aebed695e2e4193db5e",
  path: "file1.txt",
  start_line: 1,
  start_side: "RIGHT",
  line: 2,
  side: "RIGHT",
  headers: {
    "X-GitHub-Api-Version": "2022-11-28",
  },
});
