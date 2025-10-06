/**
 * Social Media Automation Engine
 * Handles automated posting to Facebook and Instagram
 */

import { FacebookMarketingAPI } from './facebook-marketing-api';
import { InstagramAPI } from './instagram-api';
import { TwitterAPI } from './twitter-api';

export class SocialMediaAutomation {
  private facebookAPI: FacebookMarketingAPI;
  private instagramAPI: InstagramAPI;
  private twitterAPI: TwitterAPI;

  constructor() {
    this.facebookAPI = new FacebookMarketingAPI(
      process.env.FACEBOOK_APP_ID!,
      process.env.FACEBOOK_APP_SECRET!,
      process.env.FACEBOOK_ACCESS_TOKEN!,
      process.env.FACEBOOK_PAGE_ID!
    );

    this.instagramAPI = new InstagramAPI(
      process.env.INSTAGRAM_ACCESS_TOKEN!
    );

    this.twitterAPI = new TwitterAPI();
  }

  /**
   * Post to Facebook, Instagram, and Twitter
   */
  async postToAllPlatforms(content: {
    message: string;
    imageUrl?: string;
    link?: string;
  }): Promise<{
    facebook?: any;
    instagram?: any;
    twitter?: any;
    errors?: string[];
  }> {
    const results: any = {};
    const errors: string[] = [];

    try {
      // Post to Facebook
      try {
        const facebookResult = await this.facebookAPI.createPost({
          message: content.message,
          link: content.link,
          picture: content.imageUrl
        });
        results.facebook = facebookResult;
        console.log('✅ Posted to Facebook successfully');
      } catch (error: any) {
        errors.push(`Facebook: ${error.message}`);
        console.error('❌ Facebook posting failed:', error);
      }

      // Post to Instagram (if image provided)
      if (content.imageUrl) {
        try {
          const instagramResult = await this.instagramAPI.postContent(
            content.message,
            content.imageUrl
          );
          results.instagram = instagramResult;
          console.log('✅ Posted to Instagram successfully');
        } catch (error: any) {
          errors.push(`Instagram: ${error.message}`);
          console.error('❌ Instagram posting failed:', error);
        }
      } else {
        console.log('⚠️ Skipping Instagram - no image provided');
      }

      // Post to Twitter
      try {
        const twitterResult = await this.twitterAPI.postTweet(
          content.message,
          content.imageUrl
        );
        results.twitter = twitterResult;
        console.log('✅ Posted to Twitter successfully');
      } catch (error: any) {
        errors.push(`Twitter: ${error.message}`);
        console.error('❌ Twitter posting failed:', error);
      }

    } catch (error: any) {
      errors.push(`General: ${error.message}`);
      console.error('❌ Social media automation failed:', error);
    }

    return {
      ...results,
      ...(errors.length > 0 && { errors })
    };
  }

  /**
   * Post harvest update to social media
   */
  async postHarvestUpdate(harvestData: {
    productName: string;
    quantity: number;
    imageUrl?: string;
    harvestDate: string;
  }): Promise<any> {
    const message = `🌱 Fresh ${harvestData.productName} harvested today! ${harvestData.quantity} trays ready for delivery. Order yours at chefpax.com! #microgreens #fresh #local #healthy`;

    return await this.postToAllPlatforms({
      message,
      imageUrl: harvestData.imageUrl,
      link: 'https://chefpax.com/shop'
    });
  }

  /**
   * Post delivery update to social media
   */
  async postDeliveryUpdate(deliveryData: {
    deliveryCount: number;
    imageUrl?: string;
    deliveryDate: string;
  }): Promise<any> {
    const message = `🚚 ${deliveryData.deliveryCount} fresh microgreen trays delivered today! Our local courier system ensures your microgreens arrive fresh and ready to grow. #delivery #fresh #microgreens`;

    return await this.postToAllPlatforms({
      message,
      imageUrl: deliveryData.imageUrl,
      link: 'https://chefpax.com/shop'
    });
  }

  /**
   * Post seasonal promotion to social media
   */
  async postSeasonalPromotion(promotionData: {
    title: string;
    description: string;
    discountPercent: number;
    imageUrl?: string;
    validUntil: string;
  }): Promise<any> {
    const message = `🎉 ${promotionData.title}! ${promotionData.description} Get ${promotionData.discountPercent}% off your next order. Valid until ${new Date(promotionData.validUntil).toLocaleDateString()}. Use code: CHEFPAX${promotionData.discountPercent} #promotion #microgreens #discount`;

    return await this.postToAllPlatforms({
      message,
      imageUrl: promotionData.imageUrl,
      link: 'https://chefpax.com/shop'
    });
  }

  /**
   * Post educational content to social media
   */
  async postEducationalContent(contentData: {
    title: string;
    content: string;
    imageUrl?: string;
    tips?: string[];
  }): Promise<any> {
    let message = `📚 ${contentData.title}\n\n${contentData.content}`;
    
    if (contentData.tips && contentData.tips.length > 0) {
      message += `\n\n💡 Pro Tips:\n${contentData.tips.map(tip => `• ${tip}`).join('\n')}`;
    }
    
    message += `\n\n#microgreens #education #growing #healthy`;

    return await this.postToAllPlatforms({
      message,
      imageUrl: contentData.imageUrl,
      link: 'https://chefpax.com/how-it-works'
    });
  }

  /**
   * Get combined analytics from all platforms
   */
  async getCombinedAnalytics(): Promise<{
    facebook?: any;
    instagram?: any;
    twitter?: any;
    summary?: {
      totalPosts: number;
      totalReach: number;
      totalEngagement: number;
    };
  }> {
    const results: any = {};

    try {
      // Get Facebook insights
      try {
        const facebookInsights = await this.facebookAPI.getPageInsights();
        results.facebook = facebookInsights;
      } catch (error) {
        console.error('Error fetching Facebook insights:', error);
      }

      // Get Instagram insights
      try {
        const instagramInsights = await this.instagramAPI.getAccountInsights();
        results.instagram = instagramInsights;
      } catch (error) {
        console.error('Error fetching Instagram insights:', error);
      }

      // Get Twitter insights (basic)
      try {
        const twitterConnected = await this.twitterAPI.testConnection();
        results.twitter = { connected: twitterConnected };
      } catch (error) {
        console.error('Error fetching Twitter insights:', error);
      }

      // Calculate summary (if platforms have data)
      if (results.facebook || results.instagram || results.twitter) {
        results.summary = {
          totalPosts: (results.facebook?.posts || 0) + (results.instagram?.media_count || 0) + (results.twitter?.connected ? 1 : 0),
          totalReach: (results.facebook?.reach || 0) + (results.instagram?.reach || 0) + (results.twitter?.connected ? 100 : 0),
          totalEngagement: (results.facebook?.engagement || 0) + (results.instagram?.engagement || 0) + (results.twitter?.connected ? 10 : 0)
        };
      }

    } catch (error) {
      console.error('Error getting combined analytics:', error);
    }

    return results;
  }

  /**
   * Test all API connections
   */
  async testConnections(): Promise<{
    facebook: boolean;
    instagram: boolean;
    twitter: boolean;
    errors?: string[];
  }> {
    const results = { facebook: false, instagram: false, twitter: false };
    const errors: string[] = [];

    // Test Facebook connection
    try {
      await this.facebookAPI.getPageInfo();
      results.facebook = true;
      console.log('✅ Facebook API connection successful');
    } catch (error: any) {
      errors.push(`Facebook: ${error.message}`);
      console.error('❌ Facebook API connection failed:', error);
    }

    // Test Instagram connection
    try {
      await this.instagramAPI.getAccountInfo();
      results.instagram = true;
      console.log('✅ Instagram API connection successful');
    } catch (error: any) {
      errors.push(`Instagram: ${error.message}`);
      console.error('❌ Instagram API connection failed:', error);
    }

    // Test Twitter connection
    try {
      const twitterConnected = await this.twitterAPI.testConnection();
      results.twitter = twitterConnected;
      console.log('✅ Twitter API connection successful');
    } catch (error: any) {
      errors.push(`Twitter: ${error.message}`);
      console.error('❌ Twitter API connection failed:', error);
    }

    return {
      ...results,
      ...(errors.length > 0 && { errors })
    };
  }
}
