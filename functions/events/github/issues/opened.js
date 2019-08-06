const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

const { createIssueAttachments } = require('../../../../helpers');

/**
* An HTTP endpoint that acts as a webhook for GitHub issues opened event
* @param {object} event
* @returns {any}
*/
module.exports = async event => {
  let issue = event.issue;
  let repository = event.repository.full_name;

  let { ts } = await lib.slack.channels['@0.4.23'].messages.create({
    channel: '#issues',
    attachments: createIssueAttachments({
      issueId: issue.number,
      issueOpener: issue.user.login,
      issueOpenerURL: `https://github.com/${issue.user.login}/`,
      issueTitle: issue.title,
      issueUrl: `https://github.com/${repository}/issues/${issue.number}/`,
      repository,
      repositoryURL: `https://github.com/${repository}/`
    })
  });

  await lib.airtable.query['@0.2.2'].insert({
    table: 'Issues',
    fields: {
      Id: issue.number,
      Status: 'Open',
      Title: issue.title,
      Opener: issue.user.login,
      Repository: repository,
      'Slack Message Timestamp': ts
    }
  });

  return;
};
