/**
 * Server-side reCAPTCHA verification
 * Google requires server-side verification for proper reCAPTCHA usage
 */

export async function verifyRecaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  
  if (!secretKey) {
    console.error('RECAPTCHA_SECRET_KEY is not configured')
    return { success: false, error: 'reCAPTCHA is not properly configured' }
  }

  if (!token) {
    return { success: false, error: 'No reCAPTCHA token provided' }
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()

    if (!data.success) {
      console.error('reCAPTCHA verification failed:', data['error-codes'])
      return { 
        success: false, 
        error: 'reCAPTCHA verification failed. Please try again.' 
      }
    }

    // Optional: Check score for v3 (if you upgrade later)
    // if (data.score && data.score < 0.5) {
    //   return { success: false, error: 'Low reCAPTCHA score' }
    // }

    return { success: true }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return { success: false, error: 'Failed to verify reCAPTCHA' }
  }
}

