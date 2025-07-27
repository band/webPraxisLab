import { type NextRequest, NextResponse } from "next/server"

interface GitHubFileResponse {
  sha: string
  content: string
}

interface UpdateFileRequest {
  owner: string
  repo: string
  path: string
  content: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, path, content, message }: UpdateFileRequest = await request.json()

    // Validate required fields
    if (!owner || !repo || !path || !content || !message) {
      return NextResponse.json(
        { message: "Missing required fields: owner, repo, path, content, message" },
        { status: 400 },
      )
    }

    // Check for GitHub token
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      return NextResponse.json(
        { message: "GitHub token not configured. Please set GITHUB_TOKEN environment variable." },
        { status: 500 },
      )
    }

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

    // First, try to get the current file to get its SHA (required for updates)
    let fileSha: string | null = null

    try {
      const getResponse = await fetch(baseUrl, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Vercel-GitHub-File-Updater",
        },
      })

      if (getResponse.ok) {
        const fileData: GitHubFileResponse = await getResponse.json()
        fileSha = fileData.sha
      } else if (getResponse.status !== 404) {
        // If it's not a 404 (file doesn't exist), something else went wrong
        const errorData = await getResponse.json()
        return NextResponse.json(
          { message: `Failed to check existing file: ${errorData.message}` },
          { status: getResponse.status },
        )
      }
      // If it's 404, the file doesn't exist and we'll create it (fileSha remains null)
    } catch (error) {
      return NextResponse.json({ message: "Failed to check existing file" }, { status: 500 })
    }

    // Prepare the update/create request
    const updateData = {
      message,
      content: Buffer.from(content).toString("base64"),
      ...(fileSha && { sha: fileSha }), // Only include SHA if file exists
    }

    // Update or create the file
    const updateResponse = await fetch(baseUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "Vercel-GitHub-File-Updater",
      },
      body: JSON.stringify(updateData),
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      return NextResponse.json({ message: `GitHub API error: ${errorData.message}` }, { status: updateResponse.status })
    }

    const result = await updateResponse.json()

    return NextResponse.json({
      message: fileSha ? "File updated successfully!" : "File created successfully!",
      commit: {
        sha: result.commit.sha,
        url: result.commit.html_url,
      },
    })
  } catch (error) {
    console.error("Error updating GitHub file:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Optional: Add GET method to retrieve file content
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get("owner")
  const repo = searchParams.get("repo")
  const path = searchParams.get("path")

  if (!owner || !repo || !path) {
    return NextResponse.json({ message: "Missing required query parameters: owner, repo, path" }, { status: 400 })
  }

  const githubToken = process.env.GITHUB_TOKEN
  if (!githubToken) {
    return NextResponse.json({ message: "GitHub token not configured" }, { status: 500 })
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Vercel-GitHub-File-Updater",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ message: `GitHub API error: ${errorData.message}` }, { status: response.status })
    }

    const fileData: GitHubFileResponse = await response.json()
    const content = Buffer.from(fileData.content, "base64").toString("utf-8")

    return NextResponse.json({
      content,
      sha: fileData.sha,
    })
  } catch (error) {
    console.error("Error fetching GitHub file:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
