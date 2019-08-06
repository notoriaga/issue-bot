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

  let { id } = await lib.slack.channels['@0.4.23'].retrieve({ channel: '#issues' });
  await lib.slack.messages['@0.4.5'].ephemeral.create({
    channelId: event.channel_id,
    userId: event.user_id,
    text: `Thanks for signing up! You can now be assigned issues through Slack. They'll appear in the <#${id}|issues> channel.`,
    as_user: true
  });

  let shouldUpdate = await lib.airtable.query['@0.2.2']
    .count({
      table: 'Users',
      where: {
        'Slack Id': event.user_id
      }
    })
    .then(results => results.count > 0);

  if (shouldUpdate) {
    await lib.airtable.query['@0.2.2'].update({
      table: 'Users',
      where: {
        'Slack Id': event.user_id
      },
      fields: {
        'GitHub Username': githubUsername
      }
    });
  } else {
    await lib.airtable.query['@0.2.2'].insert({
      table: 'Users',
      fields: {
        'GitHub Username': githubUsername,
        'Slack Id': event.user_id
      }
    });
  }

  return;
};
