const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { path = '' } = event.queryStringParameters || {};

    const response = await octokit.rest.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: path,
    });

    // Filter for files only (not directories)
    const files = Array.isArray(response.data) 
      ? response.data.filter(item => item.type === 'file')
      : [response.data];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        files: files.map(file => ({
          name: file.name,
          path: file.path,
          sha: file.sha,
          size: file.size,
          type: file.type
        }))
      })
    };

  } catch (error) {
    console.error('Error listing files:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to list files',
        details: error.message 
      })
    };
  }
};
