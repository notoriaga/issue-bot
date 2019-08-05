const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

/**
* An HTTP endpoint that acts as a webhook for Slack interactive_message
* @param {object} event Slack command event body (raw)
* @returns {any}
*/
module.exports = async event => {
  let [assignee, issueId, repository] = event.actions[0].selected_options[0].value.split('|');

  await lib.github.issues.addAssignees({
    owner: repository.split('/')[0],
    repo: repository.split('/')[1],
    issue_number: parseInt(issueId),
    assignees: [assignee]
  });

  return;
};
