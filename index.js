const core = require('@actions/core');
const github = require('@actions/github');

const main = async () => {

    const owner = core.getInput('owner', { required: true });
    const repo = core.getInput('repo', { required: true });
    const pr_number = core.getInput('pr_number', { required: true });
    const token = core.getInput('token', { required: true });
    const orgName = core.getInput('jira_org', { required: true});
    const ticketPrefix = core.getInput('ticket_prefixes', { required: true});

    const octokit = new github.getOctokit(token);

    const ticketPrefixes = []
    for (let p of ticketPrefix.split(",")) {
        ticketPrefixes.push(p)
    }

    const prTitle = github.context.payload.pull_request.title

    const issueNumbers = []

    for (let p of ticketPrefixes) {
        match = prTitle.match(RegExp(`${p}-[0-9]+`, "g"))
        if (match !== null) {
            issueNumbers.push(match)
        }
    }

    if (issueNumbers.length === 0) {
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

    const jiraIssue = issueNumbers[0] 

    try {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pr_number,
      body: `This PR contains changes referring to ticket [${jiraIssue}](https://${orgName}.atlassian.net/browse/${jiraIssue})`
    });

    } catch (error) {
    core.setFailed(error.message);
    }
}

// Call the main function to run the action
main();
