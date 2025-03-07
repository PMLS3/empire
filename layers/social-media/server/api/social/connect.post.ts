import { defineEventHandler, readBody } from 'h3'
import { SocialPlatform } from '../../../types'
import { getOAuthURL } from '../../utils/platform-auth'

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody(event)
    const { platform, workspace_id } = body

    // Validate inputs
    if (!platform || !workspace_id) {
      return {
        statusCode: 400,
        body: { error: 'Missing required parameters: platform or workspace_id' }
      }
    }

    if (!Object.values(SocialPlatform).includes(platform)) {
      return {
        statusCode: 400,
        body: { error: 'Invalid platform' }
      }
    }

    // Get authentication URL for the selected platform
    const authURL = await getOAuthURL(platform as SocialPlatform, workspace_id)

    return {
      url: authURL,
      platform,
      workspace_id
    }
  } catch (error) {
    console.error('Error in connect endpoint:', error)
    return {
      statusCode: 500,
      body: { error: 'Failed to generate authentication URL' }
    }
  }
})