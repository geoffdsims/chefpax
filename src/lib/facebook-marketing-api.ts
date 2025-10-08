/**
 * Facebook Marketing API Integration for ChefPax
 * Handles posting to Facebook Pages and managing content
 */

interface FacebookConfig {
  appId: string;
  appSecret: string;
  accessToken: string;
  pageId: string;
}

interface FacebookPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export class FacebookMarketingAPI {
  private appId: string;
  private appSecret: string;
  private accessToken: string;
  private pageId: string;
  private baseUrl = 'https://graph.facebook.com/v23.0';

  constructor(appId: string, appSecret: string, accessToken: string, pageId: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.accessToken = accessToken;
    this.pageId = pageId;
  }

  /**
   * Create a post on Facebook Page
   */
  async createPost(params: { message: string; link?: string; picture?: string }): Promise<FacebookPostResult> {
    try {
      const url = `${this.baseUrl}/${this.pageId}/feed`;
      
      const body: any = {
        message: params.message,
        access_token: this.accessToken,
      };

      if (params.link) {
        body.link = params.link;
      }
      if (params.picture) {
        body.picture = params.picture;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Facebook API error:', data);
        return {
          success: false,
          error: data.error?.message || 'Unknown error',
        };
      }

      return {
        success: true,
        postId: data.id,
      };
    } catch (error) {
      console.error('Error posting to Facebook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Post photo to Facebook Page
   */
  async postPhoto(imageUrl: string, caption?: string): Promise<FacebookPostResult> {
    try {
      const url = `${this.baseUrl}/${this.pageId}/photos`;
      
      const body: any = {
        url: imageUrl,
        access_token: this.accessToken,
      };

      if (caption) {
        body.caption = caption;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Facebook API error:', data);
        return {
          success: false,
          error: data.error?.message || 'Unknown error',
        };
      }

      return {
        success: true,
        postId: data.id,
      };
    } catch (error) {
      console.error('Error posting photo to Facebook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get page information
   */
  async getPageInfo() {
    try {
      const url = `${this.baseUrl}/${this.pageId}?fields=id,name,fan_count&access_token=${this.accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get page info');
      }

      return data;
    } catch (error) {
      console.error('Error getting Facebook page info:', error);
      throw error;
    }
  }

  /**
   * Get page insights
   */
  async getPageInsights() {
    try {
      const url = `${this.baseUrl}/${this.pageId}/insights?metric=page_impressions,page_engaged_users&access_token=${this.accessToken}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get insights');
      }

      return data.data;
    } catch (error) {
      console.error('Error getting Facebook insights:', error);
      throw error;
    }
  }

  /**
   * Verify Page Access Token is valid
   */
  async verifyToken(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/me?access_token=${this.accessToken}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error('Token verification failed:', data);
        return false;
      }

      // Check if this is a page token by verifying it has page-level permissions
      return data.id === this.pageId;
    } catch (error) {
      console.error('Error verifying token:', error);
      return false;
    }
  }
}

/**
 * Create Facebook Marketing API instance from environment variables
 */
export function createFacebookAPI(): FacebookMarketingAPI | null {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!appId || !appSecret || !accessToken || !pageId) {
    console.warn('Facebook API credentials not configured');
    return null;
  }

  return new FacebookMarketingAPI(
    appId,
    appSecret,
    accessToken,
    pageId
  );
}

