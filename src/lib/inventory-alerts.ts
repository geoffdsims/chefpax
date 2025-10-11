/**
 * Inventory Alert System for ChefPax
 * Monitors stock levels and sends automated alerts
 */

import { EmailService } from './email-service';
import { SMSService } from './sms-service';

export interface InventoryItem {
  productId: string;
  productName: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  weeklyCapacity: number;
}

export interface AlertPreferences {
  email?: string;
  phone?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export class InventoryAlertSystem {
  /**
   * Check inventory levels and send alerts if needed
   */
  static async checkInventoryLevels(
    items: InventoryItem[],
    preferences: AlertPreferences
  ): Promise<{
    alertsSent: number;
    lowStockItems: InventoryItem[];
    reorderItems: InventoryItem[];
  }> {
    const lowStockItems: InventoryItem[] = [];
    const reorderItems: InventoryItem[] = [];
    let alertsSent = 0;

    for (const item of items) {
      // Check if at or below reorder point
      if (item.currentStock <= item.reorderPoint) {
        reorderItems.push(item);
        await this.sendReorderAlert(item, preferences);
        alertsSent++;
      }
      // Check if low stock (but not yet at reorder point)
      else if (item.currentStock <= item.lowStockThreshold) {
        lowStockItems.push(item);
        await this.sendLowStockAlert(item, preferences);
        alertsSent++;
      }
    }

    return { alertsSent, lowStockItems, reorderItems };
  }

  /**
   * Send low stock alert
   */
  private static async sendLowStockAlert(
    item: InventoryItem,
    preferences: AlertPreferences
  ): Promise<void> {
    // Send email alert
    if (preferences.emailEnabled && preferences.email) {
      const subject = `⚠️ Low Stock Alert: ${item.productName}`;
      const message = `
        <h2>Low Stock Alert</h2>
        <p><strong>${item.productName}</strong> is running low.</p>
        <ul>
          <li>Current Stock: ${item.currentStock} units</li>
          <li>Low Stock Threshold: ${item.lowStockThreshold} units</li>
          <li>Reorder Point: ${item.reorderPoint} units</li>
          <li>Weekly Capacity: ${item.weeklyCapacity} units</li>
        </ul>
        <p>Consider scheduling additional production soon.</p>
      `;

      console.log(`📧 Sending low stock email for ${item.productName}`);
      // EmailService implementation would go here
    }

    // Send SMS alert
    if (preferences.smsEnabled && preferences.phone) {
      await SMSService.sendLowStockAlert({
        adminPhone: preferences.phone,
        productName: item.productName,
        currentStock: item.currentStock,
        threshold: item.lowStockThreshold
      });
    }
  }

  /**
   * Send urgent reorder alert
   */
  private static async sendReorderAlert(
    item: InventoryItem,
    preferences: AlertPreferences
  ): Promise<void> {
    // Send email alert
    if (preferences.emailEnabled && preferences.email) {
      const subject = `🚨 URGENT: Reorder Required - ${item.productName}`;
      const message = `
        <h2 style="color: #d32f2f;">URGENT: Reorder Required</h2>
        <p><strong>${item.productName}</strong> has reached the reorder point.</p>
        <ul>
          <li>Current Stock: <strong style="color: #d32f2f;">${item.currentStock} units</strong></li>
          <li>Reorder Point: ${item.reorderPoint} units</li>
          <li>Weekly Capacity: ${item.weeklyCapacity} units</li>
        </ul>
        <p><strong>Action Required:</strong> Schedule production immediately to avoid stockouts.</p>
      `;

      console.log(`🚨 Sending urgent reorder email for ${item.productName}`);
      // EmailService implementation would go here
    }

    // Send SMS alert
    if (preferences.smsEnabled && preferences.phone) {
      await SMSService.sendLowStockAlert({
        adminPhone: preferences.phone,
        productName: item.productName,
        currentStock: item.currentStock,
        threshold: item.reorderPoint
      });
    }
  }

  /**
   * Calculate reorder quantity based on demand
   */
  static calculateReorderQuantity(
    item: InventoryItem,
    averageWeeklySales: number
  ): number {
    // Calculate weeks of supply remaining
    const weeksRemaining = item.currentStock / averageWeeklySales;

    // If less than 1 week remaining, order 2 weeks worth
    if (weeksRemaining < 1) {
      return Math.min(averageWeeklySales * 2, item.weeklyCapacity);
    }

    // Otherwise order enough to reach weekly capacity
    const neededQty = item.weeklyCapacity - item.currentStock;
    return Math.max(0, neededQty);
  }

  /**
   * Get inventory health report
   */
  static async getInventoryHealth(items: InventoryItem[]): Promise<{
    healthy: InventoryItem[];
    warning: InventoryItem[];
    critical: InventoryItem[];
    healthScore: number;
  }> {
    const healthy: InventoryItem[] = [];
    const warning: InventoryItem[] = [];
    const critical: InventoryItem[] = [];

    for (const item of items) {
      if (item.currentStock <= item.reorderPoint) {
        critical.push(item);
      } else if (item.currentStock <= item.lowStockThreshold) {
        warning.push(item);
      } else {
        healthy.push(item);
      }
    }

    // Calculate health score (0-100)
    const totalItems = items.length;
    const healthScore = totalItems > 0
      ? Math.round((healthy.length / totalItems) * 100)
      : 100;

    return { healthy, warning, critical, healthScore };
  }
}

