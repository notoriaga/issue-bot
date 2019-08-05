const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

/**
* An HTTP endpoint that acts as a webhook for Slack interactive_messageg
* @param {object} event Slack command event body (raw)
* @returns {any}
*/
module.exports = async event => {
  console.log(JSON.stringify(event, null, 2));
  return;
};
