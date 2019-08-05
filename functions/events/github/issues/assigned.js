const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

const { createIssueAttachments } = require('../../../../helpers');

/**
* An HTTP endpoint that acts as a webhook for GitHub issues assigned event
* @param {object} event
* @returns {any}
*/
module.exports = async event => {
  let assignee = event.issue.assignee.login;
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

  let assignees = issue.fields.assignees || [];
  assignees.push(user.id);

  await lib.airtable.query['@0.2.2'].update({
    table: 'Issues',
    where: {
      Id: issueId
    },
    fields: {
      Assignees: assignees
    }
  });

  return;
};
