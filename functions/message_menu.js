/**
* An HTTP endpoint that acts as a webhook for GitHub issues opened event
* @param {object} event
* @returns {any}
*/
module.exports = async event => {
  console.log(JSON.stringify(event, null, 2));
};
