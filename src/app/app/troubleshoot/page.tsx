"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle, Settings, Key, ExternalLink, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function TroubleshootPage() {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/app/settings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
          <h1 className="text-xl font-bold">BYOK Troubleshooting Guide</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Bring Your Own Key (BYOK) Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This guide helps you resolve common issues when adding and using your own AI API keys in RRise.
            </p>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-500">
                <strong>Note:</strong> RRise uses your API keys to make requests to AI providers (OpenAI, Gemini, Claude, etc.). Your keys are stored securely and never shared.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How to Get API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              How to Get API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OpenAI */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">OpenAI</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com/api-keys</a></li>
                <li>Sign in or create an account</li>
                <li>Click "Create new secret key"</li>
                <li>Copy the key (starts with sk-...)</li>
                <li>Paste it in RRise settings</li>
              </ol>
            </div>

            {/* Google Gemini */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Google Gemini</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.cloud.google.com/apis/credentials</a></li>
                <li>Select or create a project</li>
                <li>Click "Create Credentials" → "API Key"</li>
                <li>Enable "Generative Language API" in APIs & Services</li>
                <li>Copy the API key</li>
                <li>Paste it in RRise settings</li>
              </ol>
            </div>

            {/* Anthropic Claude */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Anthropic (Claude)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.anthropic.com</a></li>
                <li>Sign in or create an account</li>
                <li>Go to API Keys section</li>
                <li>Click "Create Key"</li>
                <li>Copy the key (starts with sk-ant-...)</li>
                <li>Paste it in RRise settings</li>
              </ol>
            </div>

            {/* Groq */}
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Groq</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.groq.com/keys</a></li>
                <li>Sign in or create an account</li>
                <li>Create a new API key</li>
                <li>Copy the key</li>
                <li>Paste it in RRise settings</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Common Errors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Common Errors and Solutions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 403 Permission Denied */}
            <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-500 mb-2">403 Permission Denied</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your project has been denied access to the AI API.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Go to your provider console (e.g., Google Cloud Console for Gemini)</li>
                      <li>Enable the required API (e.g., "Generative Language API" for Gemini)</li>
                      <li>Check API key restrictions - ensure your domain is allowed</li>
                      <li>Verify billing is enabled for your project</li>
                      <li>If using Gemini, ensure your project is not blocked by Google</li>
                      <li>Try creating a new project and generating a fresh API key</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 401 Unauthorized */}
            <div className="p-4 border border-orange-500/20 bg-orange-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-500 mb-2">401 Unauthorized / Invalid API Key</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    The API key you provided is invalid or has been revoked.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Double-check the API key for typos or extra spaces</li>
                      <li>Ensure you copied the entire key (don't truncate it)</li>
                      <li>Verify the key is still active in your provider console</li>
                      <li>Regenerate the key if it was compromised or expired</li>
                      <li>Make sure you're using the correct key for the selected provider</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 429 Rate Limit */}
            <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-500 mb-2">429 Quota Exceeded / Rate Limit</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    You've exceeded your API rate limit or quota.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Wait a few minutes and try again</li>
                      <li>Check your usage in the provider console</li>
                      <li>Upgrade your plan if you need higher limits</li>
                      <li>Consider using a different provider with better free tier</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Error */}
            <div className="p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-500 mb-2">Network Error / Connection Failed</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Unable to connect to the AI API.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Check your internet connection</li>
                      <li>Verify you're not behind a corporate firewall blocking API calls</li>
                      <li>Try using a VPN if your region restricts certain providers</li>
                      <li>Check if the provider's API is experiencing outages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Not Found */}
            <div className="p-4 border border-purple-500/20 bg-purple-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-purple-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-purple-500 mb-2">Model Not Found</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    The requested AI model is not available.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Check if the model name is correct</li>
                      <li>Verify the model is available in your region</li>
                      <li>Some models require specific access or beta enrollment</li>
                      <li>Try selecting a different model from the dropdown</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Not Saving */}
            <div className="p-4 border border-gray-500/20 bg-gray-500/5 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-500 mb-2">Key Not Saving in Settings</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your API key doesn't appear after adding it.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Solutions:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Ensure you're logged in to your RRise account</li>
                      <li>Check browser console for any error messages</li>
                      <li>Try refreshing the page after saving</li>
                      <li>Clear browser cache and try again</li>
                      <li>Verify Supabase is properly configured</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Never share your API keys with anyone</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use environment variables for production deployments</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Rotate your API keys regularly for security</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Monitor your usage to avoid unexpected charges</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Use the free tier first before upgrading to paid plans</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Still Need Help */}
        <Card>
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you're still experiencing issues after trying these solutions, please contact us for further assistance.
            </p>
            <Link href="/contact">
              <Button>
                Contact Support
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
