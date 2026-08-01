import * as core from "@actions/core";
import * as github from "@actions/github";
import { createFailurePayload, getBranchName } from "./payload.js";

async function run(): Promise<void> {
  const inputs = {
    webhookUrl: core.getInput("webhook-url", { required: true }),
    token: core.getInput("token", { required: true }),
  };

  const serverUrl = process.env.GITHUB_SERVER_URL || "https://github.com";
  const repo = process.env.GITHUB_REPOSITORY || "";
  const workflow = process.env.GITHUB_WORKFLOW;
  const jobName = process.env.GITHUB_JOB;
  const jobHtmlUrl = await getCurrentJob(inputs.token);
  const branch = getBranchName(process.env);
  const payload = createFailurePayload({
    serverUrl,
    repo,
    workflow,
    jobName,
    jobHtmlUrl,
    branch,
  });

  const res = await fetch(inputs.webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to send Discord webhook: ` +
        `${res.status} ${res.statusText} - ${await res.text()}`,
    );
  }

  core.info("Discord notification sent.");
}

async function getCurrentJob(token: string): Promise<string> {
  const octokit = github.getOctokit(token);

  const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    run_id: github.context.runId,
  });

  const currentJob = jobs.data.jobs.find(
    (j) => j.name === process.env.GITHUB_JOB,
  );

  return currentJob?.html_url ?? "";
}

run().catch((reason) =>
  core.setFailed(reason instanceof Error ? reason : new Error(String(reason))),
);
