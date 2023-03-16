const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {

    const owner = core.getInput('owner', { required: true });
    const repo = core.getInput('repo', { required: true });
    const pr_number = core.getInput('pr_number', { required: true });
    const token = core.getInput('token', { required: true });
    const orgName = core.getInput('jira_org', { required: true});

    const octokit = new github.getOctokit(token);

    const ticketRegex = RegExp("DMT-[0-9]+", "g")
    const prTitle = github.context.payload.pull_request.title
    const ticketNumber = prTitle.match(ticketRegex)

    if (ticketNumber.length === 0) {
        try {
            await octokit.rest.issues.createComment({
              owner,
              repo,
              issue_number: pr_number,
              body: `
                No JIRA issue number found in PR title
              `
            });

        } catch (error) {
            core.setFailed(error.message);
        }
    }

  try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr_number,
      body: `
        This PR contains changes referring to ticket [${ticketNumber[0]}](https://${orgName}.atlassian.net/browse/${ticketNumber[0]}) 
      `
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

// Call the main function to run the action
main();
