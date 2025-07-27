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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { path, content, message, sha } = JSON.parse(event.body);

    if (!path || !content || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Path, content, and message are required' 
        })
      };
    }

    // If no SHA provided, get current file SHA
    let fileSha = sha;
    if (!fileSha) {
      try {
        const currentFile = await octokit.rest.repos.getContent({
          owner: process.env.GITHUB_OWNER,
          repo: process.env.GITHUB_REPO,
          path: path,
        });
        fileSha = currentFile.data.sha;
      } catch (error) {
        // File might not exist, that's okay for new files
        fileSha = undefined;
      }
    }

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: path,
      message: message,
      content: Buffer.from(content).toString('base64'),
      ...(fileSha && { sha: fileSha })
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        commit: response.data.commit,
        content: response.data.content
      })
    };

  } catch (error) {
    console.error('Error updating file:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to update file',
        details: error.message 
      })
    };
  }
};
