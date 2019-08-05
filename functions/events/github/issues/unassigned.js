const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

/**
* An HTTP endpoint that acts as a webhook for GitHub issues unassigned event
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

  let assignees = (issue.fields.Assignees || []).filter(assignee => assignee !== user.id);

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
