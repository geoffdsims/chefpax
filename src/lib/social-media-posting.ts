/**
 * Social Media Posting Automation for ChefPax
 * Handles automatic posting to Facebook and Instagram for harvest updates
 */

import { createFacebookAPI } from './facebook-marketing-api';
import { InstagramAPI } from './instagram-api';

export interface HarvestPost {
  productName: string;
  quantity: number;
  harvestDate: Date;
  availableDate: Date;
  imageUrl?: string;
  specialNotes?: string;
}

export class SocialMediaPostingService {
  /**
   * Post harvest announcement to all configured social media platforms
   */
  static async postHarvestAnnouncement(harvest: HarvestPost): Promise<{
    facebook: boolean;
    instagram: boolean;
    errors: string[];
  }> {
    const results = {
      facebook: false,
      instagram: false,
      errors: [] as string[]
    };

    // Generate post content
    const message = this.generateHarvestMessage(harvest);

    // Post to Facebook
    try {
      const facebookAPI = createFacebookAPI();
      if (facebookAPI) {
        const fbResult = await facebookAPI.createPost({
          message,
          link: `https://chefpax.com/shop?product=${encodeURIComponent(harvest.productName)}`
        });
        results.facebook = fbResult.success;
        if (!fbResult.success) {
          results.errors.push(`Facebook: ${fbResult.error || 'Unknown error'}`);
        }
      } else {
        results.errors.push('Facebook API not configured');
      }
    } catch (error: any) {
      results.errors.push(`Facebook error: ${error.message}`);
    }

    // Post to Instagram
    try {
      const instagramAPI = new InstagramAPI(
        process.env.FACEBOOK_ACCESS_TOKEN || '',
        process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || ''
      );
      
      if (process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID && harvest.imageUrl) {
        const igResult = await instagramAPI.postContent({
          image_url: harvest.imageUrl,
          caption: message
        });
        results.instagram = igResult.success;
        if (!igResult.success) {
          results.errors.push(`Instagram: ${igResult.error || 'Unknown error'}`);
        }
      } else {
        results.errors.push('Instagram not configured or no image provided');
      }
    } catch (error: any) {
      results.errors.push(`Instagram error: ${error.message}`);
    }

    return results;
  }

  /**
   * Post weekly harvest schedule
   */
  static async postWeeklySchedule(harvests: HarvestPost[]): Promise<{
    facebook: boolean;
    instagram: boolean;
    errors: string[];
  }> {
    const results = {
      facebook: false,
      instagram: false,
      errors: [] as string[]
    };

    const message = this.generateWeeklyScheduleMessage(harvests);

    // Post to Facebook
    try {
      const facebookAPI = createFacebookAPI();
      if (facebookAPI) {
        const fbResult = await facebookAPI.createPost({
          message,
          link: 'https://chefpax.com/shop'
        });
        results.facebook = fbResult.success;
        if (!fbResult.success) {
          results.errors.push(`Facebook: ${fbResult.error || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      results.errors.push(`Facebook error: ${error.message}`);
    }

    // Post to Instagram (if there's a featured image)
    if (harvests.length > 0 && harvests[0].imageUrl) {
      try {
        const instagramAPI = new InstagramAPI(
          process.env.FACEBOOK_ACCESS_TOKEN || '',
          process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || ''
        );
        
        if (process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
          const igResult = await instagramAPI.postContent({
            image_url: harvests[0].imageUrl,
            caption: message
          });
          results.instagram = igResult.success;
          if (!igResult.success) {
            results.errors.push(`Instagram: ${igResult.error || 'Unknown error'}`);
          }
        }
      } catch (error: any) {
        results.errors.push(`Instagram error: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Post special promotion or sale
   */
  static async postPromotion(
    title: string,
    description: string,
    imageUrl?: string,
    linkUrl?: string
  ): Promise<{
    facebook: boolean;
    instagram: boolean;
    errors: string[];
  }> {
    const results = {
      facebook: false,
      instagram: false,
      errors: [] as string[]
    };

    const message = `🌟 ${title}\n\n${description}\n\n🛒 Shop now: ${linkUrl || 'https://chefpax.com/shop'}\n\n#ChefPax #Microgreens #AustinLocal #FreshProduce #HealthyEating`;

    // Post to Facebook
    try {
      const facebookAPI = createFacebookAPI();
      if (facebookAPI) {
        const fbResult = await facebookAPI.createPost({
          message,
          link: linkUrl || 'https://chefpax.com/shop'
        });
        results.facebook = fbResult.success;
        if (!fbResult.success) {
          results.errors.push(`Facebook: ${fbResult.error || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      results.errors.push(`Facebook error: ${error.message}`);
    }

    // Post to Instagram
    if (imageUrl && process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID) {
      try {
        const instagramAPI = new InstagramAPI(
          process.env.FACEBOOK_ACCESS_TOKEN || '',
          process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || ''
        );
        
        const igResult = await instagramAPI.postContent({
          image_url: imageUrl,
          caption: message
        });
        results.instagram = igResult.success;
        if (!igResult.success) {
          results.errors.push(`Instagram: ${igResult.error || 'Unknown error'}`);
        }
      } catch (error: any) {
        results.errors.push(`Instagram error: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Generate harvest announcement message
   */
  private static generateHarvestMessage(harvest: HarvestPost): string {
    const availableDateStr = new Date(harvest.availableDate).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    let message = `🌱 Fresh Harvest Alert! 🌱\n\n`;
    message += `Just harvested ${harvest.quantity} trays of ${harvest.productName}!\n\n`;
    message += `✅ Available: ${availableDateStr}\n`;
    message += `📍 Austin, TX - Same-day delivery available\n\n`;
    
    if (harvest.specialNotes) {
      message += `${harvest.specialNotes}\n\n`;
    }
    
    message += `Order now for peak freshness! 🍃\n\n`;
    message += `#ChefPax #Microgreens #AustinLocal #FreshHarvest #FarmToTable #HealthyEating #LocalFood`;

    return message;
  }

  /**
   * Generate weekly schedule message
   */
  private static generateWeeklyScheduleMessage(harvests: HarvestPost[]): string {
    let message = `📅 This Week's Harvest Schedule 📅\n\n`;
    message += `Fresh microgreens coming your way! Here's what's being harvested:\n\n`;

    harvests.forEach((harvest, index) => {
      const dateStr = new Date(harvest.availableDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      message += `${index + 1}. ${harvest.productName} - ${dateStr}\n`;
    });

    message += `\n🛒 Pre-order now for guaranteed availability!\n`;
    message += `📍 Austin, TX - Same-day delivery available\n\n`;
    message += `#ChefPax #Microgreens #AustinLocal #WeeklyHarvest #FarmToTable #HealthyEating`;

    return message;
  }
}

