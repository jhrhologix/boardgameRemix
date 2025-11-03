import { NextResponse } from 'next/server'

/**
 * Test endpoint to verify BGG API token is configured correctly
 * This helps debug environment variable issues
 */
export async function GET() {
  const bggToken = process.env.BGG_API_TOKEN
  
  // Return status without exposing the actual token
  return NextResponse.json({
    hasToken: !!bggToken,
    tokenLength: bggToken ? bggToken.length : 0,
    tokenPrefix: bggToken ? `${bggToken.substring(0, 8)}...` : null,
    environment: process.env.NODE_ENV,
    message: bggToken 
      ? 'BGG API token is configured ✅' 
      : '⚠️ BGG_API_TOKEN environment variable is not set',
    instructions: !bggToken ? [
      '1. Go to Vercel dashboard → Your project → Settings → Environment Variables',
      '2. Add variable: BGG_API_TOKEN = your-token-from-bgg',
      '3. Make sure it\'s set for Production, Preview, and Development',
      '4. Redeploy your application (Vercel requires redeploy for env vars to take effect)'
    ] : null
  })
}
