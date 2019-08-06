const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

const { createIssueAttachments } = require('../../../../helpers');

/**
* An HTTP endpoint that acts as a webhook for GitHub issues closed event
* @param {object} event
* @returns {any}
*/
module.exports = async event => {
  let issue = await lib.airtable.query['@0.2.2']
    .select({
      table: 'Issues',
      where: {
        Id: event.issue.number
      }
    })
    .then(results => results.rows.pop());

  if (!issue) {
    throw new Error(`Could not find a record for issue ${event.issue.number} in Airtable.`);
  }

  let { id } = await lib.slack.channels['@0.4.23'].retrieve({ channel: '#issues' });
  await lib.slack.messages['@0.4.6'].destroy({
    id: id,
    ts: issue.fields['Slack Message Timestamp']
  });

  await lib.airtable.query['@0.2.2'].update({
    table: 'Issues',
    where: {
      Id: event.issue.number
    },
    fields: {
      Status: 'Closed',
      'Slack Message Timestamp': null
    }
  });

  return;
};
