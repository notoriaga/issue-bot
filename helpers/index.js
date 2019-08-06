const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

function createIssueAttachments ({
  issueId,
  issueOpener,
  issueOpenerURL,
  issueTitle,
  issueUrl,
  repository,
  repositoryURL,
  assignees = null
}) {
  let fields = [
    {
      title: 'Repository',
      value: `<${repositoryURL}|${repository}>`,
      short: true
    },
    {
      title: 'Opened By',
      value: `<${issueOpenerURL}|${issueOpener}>`,
      short: true
    }
  ];

  if (assignees && assignees.length) {
    let value = assignees
      .map(assignee => {
        let githubUsername = assignee.fields['GitHub Username'];
        let slackId = assignee.fields['Slack Id'];
        return `- <https://www.github.com/${githubUsername}|${githubUsername}> aka <@${slackId}>`;
      })
      .join('\n');
    fields.push({
      title: 'Assignees',
      value: value,
      short: false
    });
  }

  return [
    {
      fallback: 'A new issue has been opened!',
      color: '#36a64f',
      pretext: 'A new issue has been opened!',
      title: `${issueTitle} #${issueId}`,
      title_link: issueUrl,
      mrkdwn_in: ['fields'],
      fields: fields,
      footer: 'Build on Standard Library',
      footer_icon: 'https://polybit-apps.s3.amazonaws.com/stdlib/users/stdlib/profile/image.png',
      ts: Math.floor(new Date().valueOf() / 1000),
      callback_id: 'add_assignee',
      actions: [
        {
          name: `${issueId}|${repository}`,
          text: 'Assignees',
          type: 'select',
          data_source: 'external',
          min_query_length: 0
        }
      ]
    }
  ];
}

async function joinAssignees (issue) {
  let ids = issue.fields.Assignees;

  for (let [index, id] of ids.entries()) {
    let user = await lib.airtable.records['@0.2.1'].retrieve({
      table: 'Users',
      id: id
    });
    issue.fields.Assignees[index] = user;
  }

  return issue;
}

module.exports = {
  createIssueAttachments,
  joinAssignees
};
