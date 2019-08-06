const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

/**
* An HTTP endpoint that generates options for a dropdown in Slack
* @param {object} payload
* @returns {object.http}
*/
module.exports = async (payload, context) => {
  let [issueId, repository] = payload.name.split('|');
  let query = payload.value || '';

  let users = await lib.airtable.query['@0.2.2']
    .select({
      table: 'Users',
      where: {
        'GitHub Username__icontains': query
      }
    })
    .then(results => results.rows);

  let options = users.map(user => {
    let username = user.fields['GitHub Username'];
    return {
      text: username,
      value: `${username}|${issueId}|${repository}`
    };
  });

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      options: options
    })
  };
};
