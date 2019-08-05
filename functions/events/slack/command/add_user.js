const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

/**
* An HTTP endpoint that acts as a webhook for Slack command event
* @param {object} event Slack command event body (raw)
* @returns {any}
*/
module.exports = async event => {
  let githubUsername = (event.text || '').trim();

  if (!githubUsername.length) {
    await lib.slack.messages['@0.4.5'].ephemeral.create({
      channelId: event.channel_id,
      userId: event.user_id,
      text: 'Please provide a GitHub username.\n/add_user <username>',
      as_user: true
    });
    return;
  }

  let isExistingUser = await lib.airtable.query['@0.2.2']
    .count({
      table: 'Users',
      where: {
        'GitHub Username': githubUsername
      }
    })
    .then(results => results.count > 0);

  if (isExistingUser) {
    await lib.slack.messages['@0.4.5'].ephemeral.create({
      channelId: event.channel_id,
      userId: event.user_id,
      text: `There is already a user registered to review pull requests with the username "${githubUsername}."`,
      as_user: true
    });
    return;
  }

  let { channel } = await lib.slack.messages['@0.4.5'].create({
    id: event.user_id,
    text:
      "Thanks for signing up! You'll get notified of issues you've been assigned in this DM.",
    as_user: true
  });

  await lib.airtable.query['@0.2.2'].insert({
    table: 'Users',
    fields: {
      'GitHub Username': githubUsername,
      'Slack Id': channel
    }
  });

  return;
};
