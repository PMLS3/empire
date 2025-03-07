import { defineEventHandler, readBody, createError } from 'h3'
import { publishToPlatform } from '../../utils/platform-api'
import { getCrypto } from '../../utils/crypto'
import { ContentStatus, PublishStatus, SocialPlatform } from '../../../types'
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody(event)
    const { contentId, platforms } = body
    
    if (!contentId || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Content ID and platforms are required'
      })
    }
    
    // Get content details from database
    const client = serverSupabaseClient(event)
    const { data: contentData, error: contentError } = await client
      .from('social_content')
      .select('*')
      .eq('id', contentId)
      .single()
    
    if (contentError || !contentData) {
      console.error('Error fetching content:', contentError)
      throw createError({
        statusCode: 404,
        message: 'Content not found'
      })
    }
    
    const content = contentData
    
    // Validate content has required platforms
    for (const platform of platforms) {
      if (!content.platforms || !content.platforms[platform]) {
        throw createError({
          statusCode: 400,
          message: `Content is not configured for platform: ${platform}`
        })
      }
    }
    
    // Process each platform in parallel
    const publishResults = await Promise.allSettled(
      platforms.map(async (platform) => {
        try {
          // Get account details
          const accountId = content.platforms[platform].accountId
          const { data: accountData, error: accountError } = await client
            .from('social_accounts')
            .select('*')
            .eq('id', accountId)
            .single()
          
          if (accountError || !accountData) {
            throw new Error(`Account not found for platform ${platform}`)
          }
          
          // Decrypt tokens if needed
          const account = accountData
          const crypto = getCrypto()
          if (typeof account.authData.accessToken === 'string' && account.authData.accessToken.includes(':')) {
            account.authData.accessToken = crypto.decrypt(account.authData.accessToken)
          }
          if (account.authData.refreshToken && account.authData.refreshToken.includes(':')) {
            account.authData.refreshToken = crypto.decrypt(account.authData.refreshToken)
          }
          
          // Publish to platform
          const publishResult = await publishToPlatform(
            platform as SocialPlatform,
            account,
            content.platforms[platform],
            content.assets
          )
          
          // Update content status in database
          const platformUpdate = {
            [`platforms.${platform}.publishStatus`]: publishResult.success ? PublishStatus.PUBLISHED : PublishStatus.FAILED,
            [`platforms.${platform}.publishTime`]: new Date().toISOString(),
            [`platforms.${platform}.publishedUrl`]: publishResult.url || null,
            [`platforms.${platform}.platformPostId`]: publishResult.id || null,
            updated_at: new Date().toISOString()
          }
          
          await client
            .from('social_content')
            .update(platformUpdate)
            .eq('id', contentId)
          
          return {
            platform,
            success: publishResult.success,
            url: publishResult.url,
            id: publishResult.id,
            error: publishResult.error
          }
        } catch (error) {
          console.error(`Error publishing to ${platform}:`, error)
          return {
            platform,
            success: false,
            error: error.message || `Failed to publish to ${platform}`
          }
        }
      })
    )
    
    // Determine overall status based on results
    const results = publishResults.map(result => 
      result.status === 'fulfilled' ? result.value : {
        platform: result.reason.platform || 'unknown',
        success: false,
        error: result.reason.message || 'Failed to publish'
      }
    )
    
    const allSucceeded = results.every(result => result.success)
    const allFailed = results.every(result => !result.success)
    
    let overallStatus
    if (allSucceeded) {
      overallStatus = ContentStatus.PUBLISHED
    } else if (allFailed) {
      overallStatus = ContentStatus.FAILED
    } else {
      overallStatus = `${ContentStatus.PUBLISHED} (partial)`
    }
    
    // Update overall content status
    await client
      .from('social_content')
      .update({
        status: overallStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId)
    
    return {
      success: !allFailed,
      status: overallStatus,
      results
    }
  } catch (error) {
    console.error('Error in publish endpoint:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to publish content'
    })
  }
})