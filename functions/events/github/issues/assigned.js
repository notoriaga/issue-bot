const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

const { createIssueAttachments, joinAssignees } = require('../../../../helpers');

/**
* An HTTP endpoint that acts as a webhook for GitHub issues assigned event
* @param {object} event
* @returns {any}
*/
module.exports = async event => {
  let assignee = event.assignee.login;
  let issueId = event.issue.number;

  let user = await lib.airtable.query['@0.2.2']
    .select({
      table: 'Users',
      where: {
        'GitHub Username': assignee
      }
    })
    .then(results => results.rows.pop());

  if (!user) {
    throw new Error(`Could not find a record for user ${assignee} in Airtable.`);
  }

  let issue = await lib.airtable.query['@0.2.2']
    .select({
      table: 'Issues',
      where: {
        Id: issueId
      }
    })
    .then(results => results.rows.pop());

  if (!issue) {
    throw new Error(`Could not find a record for issue ${issueId} in Airtable.`);
  }

  issue.fields.Assignees = (issue.fields.Assignees || []).concat(user.id);
  await joinAssignees(issue);

  let { id } = await lib.slack.channels['@0.4.23'].retrieve({ channel: '#issues' });
  let { ts } = await lib.slack.messages['@0.4.6'].update({
    id: id,
    ts: issue.fields['Slack Message Timestamp'],
    attachments: createIssueAttachments({
      issueId: issue.fields.Id,
      issueOpener: issue.fields.Opener,
      issueOpenerURL: issue.fields['Opener URL'],
      issueTitle: issue.fields.Title,
      issueUrl: issue.fields['Repository URL'],
      repository: issue.fields.Repository,
      repositoryURL: issue.fields['Repository URL'],
      assignees: issue.fields.Assignees
    })
  });

  await lib.airtable.query['@0.2.2'].update({
    table: 'Issues',
    where: {
      Id: issueId
    },
    fields: {
      Assignees: issue.fields.Assignees.map(assignee => assignee.id),
      'Slack Message Timestamp': ts
    }
  });

  return;
};
