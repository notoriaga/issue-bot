const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

function createReminderAttachments ({
  pullRequestId,
  pullRequestOpener,
  pullRequestOpenerURL,
  pullRequestTitle,
  pullRequestUrl,
  repository,
  repositoryURL
}) {
  return [
    {
      fallback: 'You have been requested to review a pull request.',
      color: '#36a64f',
      pretext: 'You have been requested to review a pull request.',
      title: `${pullRequestTitle} #${pullRequestId}`,
      title_link: pullRequestUrl,
      fields: [
        {
          title: 'Repository',
          value: `<${repositoryURL}|${repository}>`,
          short: true
        },
        {
          title: 'Opened By',
          value: `<${pullRequestOpenerURL}|${pullRequestOpener}>`,
          short: true
        }
      ],
      footer: 'Build on Standard Library',
      footer_icon: 'https://polybit-apps.s3.amazonaws.com/stdlib/users/stdlib/profile/image.png',
      ts: Math.floor(new Date().valueOf() / 1000)
    }
  ];
}

function joinReviewers (reviewRequests) {
  let requests = reviewRequests.map(async reviewRequest => {
    let recId = reviewRequest.fields.Reviewer[0];

    let reviewer = await lib.airtable.records['@0.2.1'].retrieve({
      table: 'Reviewers',
      id: recId
    });
    reviewRequest.fields.Reviewer = reviewer.fields;

    return reviewRequest;
  });

  return Promise.all(requests);
}

async function getReviewRequest ({ pullRequestId, repository, githubUsername }) {
  let reviewRequests = await lib.airtable.query['@0.2.2']
    .select({
      table: 'Review Requests',
      where: {
        'Pull Request Id': pullRequestId,
        Repository: repository
      }
    })
    .then(results => joinReviewers(results.rows));

  let reviewRequest = reviewRequests.find(review => {
    return review.fields.Reviewer['GitHub Username'] === githubUsername;
  });

  return reviewRequest;
}

module.exports = {
  createReminderAttachments,
  joinReviewers,
  getReviewRequest
};
