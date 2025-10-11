/**
 * Instagram Basic Display API Integration
 * Handles posting content and fetching insights
 */

export class InstagramAPI {
  private accessToken: string;
  private businessAccountId: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(accessToken: string, businessAccountId?: string) {
    this.accessToken = accessToken;
    this.businessAccountId = businessAccountId || '';
  }

  /**
   * Test Instagram API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.businessAccountId) {
        console.log('⚠️ Instagram Business Account ID not configured');
        return false;
      }

      const response = await fetch(
        `${this.baseUrl}/${this.businessAccountId}?fields=id,username,name&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Instagram API test failed:', errorData);
        return false;
      }

      const data = await response.json();
      console.log(`✅ Instagram API connected: @${data.username}`);
      return true;
    } catch (error) {
      console.error('Error testing Instagram connection:', error);
      return false;
    }
  }

  /**
   * Get Instagram account info
   */
  async getAccountInfo(): Promise<any> {
    try {
      if (!this.businessAccountId) {
        throw new Error('Instagram Business Account ID is required');
      }

      const response = await fetch(
        `${this.baseUrl}/${this.businessAccountId}?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count&access_token=${this.accessToken}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Instagram account info:', error);
      throw error;
    }
  }

  /**
   * Get user's media
   */
  async getUserMedia(limit = 25): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp&limit=${limit}&access_token=${this.accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user media:', error);
      throw error;
    }
  }

  /**
   * Post content to Instagram (requires Instagram Graph API for business accounts)
   */
  async postContent(caption: string, imageUrl: string): Promise<any> {
    try {
      if (!this.businessAccountId) {
        throw new Error('Instagram Business Account ID is required for posting');
      }

      // Step 1: Create media container
      const createContainerUrl = `${this.baseUrl}/${this.businessAccountId}/media`;
      const createContainerResponse = await fetch(createContainerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: this.accessToken
        })
      });

      if (!createContainerResponse.ok) {
        const errorData = await createContainerResponse.json();
        throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
      }

      const containerData = await createContainerResponse.json();
      const containerId = containerData.id;

      // Step 2: Publish the media
      const publishUrl = `${this.baseUrl}/${this.businessAccountId}/media_publish`;
      const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: this.accessToken
        })
      });

      if (!publishResponse.ok) {
        const errorData = await publishResponse.json();
        throw new Error(`Instagram API error: ${JSON.stringify(errorData)}`);
      }

      return await publishResponse.json();
    } catch (error) {
      console.error('Error posting to Instagram:', error);
      throw error;
    }
  }

  /**
   * Get media insights (requires Instagram Business Account)
   */
  async getMediaInsights(mediaId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/${mediaId}/insights?metric=impressions,reach,likes,comments,saves&access_token=${this.accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching media insights:', error);
      throw error;
    }
  }

  /**
   * Get account insights (requires Instagram Business Account)
   */
  async getAccountInsights(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/me/insights?metric=impressions,reach,profile_views&period=day&since=${Math.floor(Date.now() / 1000) - 86400}&until=${Math.floor(Date.now() / 1000)}&access_token=${this.accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching account insights:', error);
      throw error;
    }
  }

  /**
   * Exchange short-lived token for long-lived token
   */
  async exchangeToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_APP_SECRET}&access_token=${this.accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error exchanging Instagram token:', error);
      throw error;
    }
  }

  /**
   * Refresh long-lived token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${this.accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error refreshing Instagram token:', error);
      throw error;
    }
  }
}
