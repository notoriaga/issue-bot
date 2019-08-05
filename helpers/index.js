const lib = require('lib')({
  token: process.env.STDLIB_SECRET_TOKEN
});

function createIssueAttachments ({
  issueId,
  issueOpener,
  issueOpenerURL,
  issueTitle,
  issueUrl,
  repository,
  repositoryURL
}) {
  return [
    {
      fallback: 'A new issue has been opened.',
      color: '#36a64f',
      pretext: 'A new issue has been opened.',
      title: `${issueTitle} #${issueId}`,
      title_link: issueUrl,
      fields: [
        {
          title: 'Repository',
          value: `<${repositoryURL}|${repository}>`,
          short: true
        },
        {
          title: 'Opened By',
          value: `<${issueOpenerURL}|${issueOpener}>`,
          short: true
        }
      ],
      footer: 'Build on Standard Library',
      footer_icon: 'https://polybit-apps.s3.amazonaws.com/stdlib/users/stdlib/profile/image.png',
      ts: Math.floor(new Date().valueOf() / 1000),
      callback_id: 'add_assignee',
      actions: [
        {
          name: `${issueId}|${repository}`,
          text: 'Who should handle this?',
          type: 'select',
          data_source: 'external',
          min_query_length: 0
        }
      ]
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

async function getReviewRequest ({ issueId, repository, githubUsername }) {
  let reviewRequests = await lib.airtable.query['@0.2.2']
    .select({
      table: 'Review Requests',
      where: {
        'Pull Request Id': issueId,
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
  createIssueAttachments,
  joinReviewers,
  getReviewRequest
};
