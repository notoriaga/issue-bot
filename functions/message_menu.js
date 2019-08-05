const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

/**
* An HTTP endpoint that acts generates options for a dropdown in Slack
* @param {object} payload
* @returns {object.http}
*/
module.exports = async (payload, context) => {
  let users = await lib.airtable.query['@0.2.2']
    .select({
      table: 'Users',
      where: {
        'GitHub Username__icontains': payload.value || ''
      }
    })
    .then(results => results.rows);

  let options = users.map(user => {
    return {
      text: user.fields['GitHub Username'],
      value: user.fields['GitHub Username']
    };
  });

  let results = {
    options: options
  };

  return {
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(results)
  };
};
