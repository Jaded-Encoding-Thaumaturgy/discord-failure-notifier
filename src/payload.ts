const AVATAR_URL = "https://github.githubassets.com/favicons/favicon.png";
const AUTHOR_ICON_URL =
  "https://em-content.zobj.net/source/twitter/408/face-with-tears-of-joy_1f602.png";

export interface FailurePayloadOptions {
  serverUrl: string;
  repo: string;
  workflow: string | undefined;
  jobName: string | undefined;
  jobHtmlUrl: string;
  branch: string;
}

export function getBranchName(env: NodeJS.ProcessEnv): string {
  return (
    env.GITHUB_HEAD_REF ||
    env.GITHUB_REF_NAME ||
    (env.GITHUB_REF || "").replace("refs/heads/", "")
  );
}

export function createFailurePayload(options: FailurePayloadOptions) {
  return {
    username: "Github",
    avatar_url: AVATAR_URL,
    embeds: [
      {
        color: 0xff0000,
        author: {
          name: options.repo,
          url: `${options.serverUrl}/${options.repo}/tree/${options.branch}`,
          icon_url: AUTHOR_ICON_URL,
        },
        title: `"${options.jobName}" failed on ${options.branch} branch`,
        url: options.jobHtmlUrl,
        description: `**Workflow:** ${options.workflow}`,
        timestamp: new Date().toISOString(),
      },
    ],
  };
}
