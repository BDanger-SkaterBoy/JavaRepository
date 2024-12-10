import { info, setFailed } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { WebClient } from '@slack/web-api'

async function main() {
  if (!process.env.GITHUB_TOKEN) throw new TypeError('GITHUB_TOKEN not set')
  if (!process.env.SLACK_TOKEN) throw new TypeError('SLACK_TOKEN not set')

  const octokit = getOctokit(process.env.GITHUB_TOKEN)
  const slackClient = new WebClient(process.env.SLACK_TOKEN)

  const body = `
    We are in the process of closing issues dating more than two years to improve our focus on the most relevant and actionable problems.

    **_Why are we doing this?_**

    Stales issues often lack recent updates and clear reproductions, making them difficult to address effectively. Our objective is to prioritize the most upvoted and actionable issues that have up-to-date reproductions, enabling us to resolve bugs more efficiently.

    **_Why these issues?_**

    Issues dating more than two years are likely to be outdated and less relevant to the current state of the codebase. By closing these older stale issues, we can better focus our efforts on more recent and relevant problems, ensuring a more effective and streamlined workflow.

    If your issue is still relevant, please react with a 👍 on this message. Be sure to include any important context from the original issue in your new report.
    `
}

main()
