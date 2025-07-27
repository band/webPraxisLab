"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Github, FileText } from "lucide-react"

export default function GitHubFileUpdater() {
  const [formData, setFormData] = useState({
    owner: "",
    repo: "",
    path: "",
    content: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/update-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "File updated successfully!" : "Failed to update file"),
      })
    } catch (error) {
      setResult({
        success: false,
        message: "Network error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Github className="w-8 h-8" />
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">GitHub File Updater</h1>
          <p className="text-slate-600 mt-2">Update text files in your GitHub repository via serverless function</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Update Repository File</CardTitle>
            <CardDescription>
              Enter the repository details and file content to update a text file in your GitHub repository.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner">Repository Owner</Label>
                  <Input
                    id="owner"
                    placeholder="username or organization"
                    value={formData.owner}
                    onChange={(e) => handleInputChange("owner", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="repo">Repository Name</Label>
                  <Input
                    id="repo"
                    placeholder="repository-name"
                    value={formData.repo}
                    onChange={(e) => handleInputChange("repo", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="path">File Path</Label>
                <Input
                  id="path"
                  placeholder="path/to/file.txt"
                  value={formData.path}
                  onChange={(e) => handleInputChange("path", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Commit Message</Label>
                <Input
                  id="message"
                  placeholder="Update file content"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">File Content</Label>
                <Textarea
                  id="content"
                  placeholder="Enter the new content for the file..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={8}
                  required
                />
              </div>

              {result && (
                <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating File...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 mr-2" />
                    Update File
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8 p-4 bg-slate-800 rounded-lg">
          <h3 className="text-white font-semibold mb-2">Environment Variables Required:</h3>
          <code className="text-green-400 text-sm">GITHUB_TOKEN=your_github_personal_access_token</code>
          <p className="text-slate-300 text-sm mt-2">
            Create a GitHub Personal Access Token with repository permissions and add it to your Vercel environment
            variables.
          </p>
        </div>
      </div>
    </div>
  )
}
