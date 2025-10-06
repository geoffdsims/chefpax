/**
 * Instagram Basic Display API Integration
 * Handles posting content and fetching insights
 */

export class InstagramAPI {
  private accessToken: string;
  private baseUrl = 'https://graph.instagram.com';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get Instagram account info
   */
  async getAccountInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/me?fields=id,username,account_type,media_count&access_token=${this.accessToken}`);
      
      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.statusText}`);
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
      // Step 1: Create media container
      const createContainerResponse = await fetch(`${this.baseUrl}/me/media`, {
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
      const publishResponse = await fetch(`${this.baseUrl}/me/media_publish`, {
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
