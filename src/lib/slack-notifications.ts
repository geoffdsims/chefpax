interface SlackMessage {
  channel: string;
  text: string;
  attachments?: SlackAttachment[];
  blocks?: SlackBlock[];
}

interface SlackAttachment {
  color?: string;
  title?: string;
  text?: string;
  fields?: SlackField[];
  footer?: string;
  ts?: number;
}

interface SlackField {
  title: string;
  value: string;
  short?: boolean;
}

interface SlackBlock {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: SlackField[];
}

export class SlackService {
  private static webhookUrl = process.env.SLACK_WEBHOOK_URL;
  private static channel = process.env.SLACK_CHANNEL || '#production';

  static async sendProductionAlert(task: any): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log('Slack webhook not configured, skipping notification');
      return false;
    }

    try {
      const emoji = this.getTaskEmoji(task.type);
      const priorityColor = this.getPriorityColor(task.priority);
      
      const message: SlackMessage = {
        channel: this.channel,
        text: `${emoji} Production Task Ready: ${task.type}`,
        attachments: [
          {
            color: priorityColor,
            title: `${emoji} ${task.type} - ${task.quantity} trays`,
            fields: [
              {
                title: 'Product',
                value: task.productId,
                short: true
              },
              {
                title: 'Quantity',
                value: `${task.quantity} trays`,
                short: true
              },
              {
                title: 'Priority',
                value: task.priority,
                short: true
              },
              {
                title: 'Scheduled Time',
                value: new Date(task.runAt).toLocaleString(),
                short: true
              },
              {
                title: 'Notes',
                value: task.notes || 'No additional notes',
                short: false
              }
            ],
            footer: 'ChefPax Production System',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log(`✅ Slack notification sent for ${task.type} task`);
        return true;
      } else {
        console.error('Failed to send Slack notification:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending Slack notification:', error);
      return false;
    }
  }

  static async sendTaskCompletion(task: any, completionNotes?: string): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    try {
      const emoji = this.getTaskEmoji(task.type);
      
      const message: SlackMessage = {
        channel: this.channel,
        text: `✅ Task Completed: ${task.type}`,
        attachments: [
          {
            color: 'good',
            title: `✅ ${task.type} Completed`,
            fields: [
              {
                title: 'Product',
                value: task.productId,
                short: true
              },
              {
                title: 'Quantity',
                value: `${task.quantity} trays`,
                short: true
              },
              {
                title: 'Completed At',
                value: new Date().toLocaleString(),
                short: true
              }
            ],
            footer: 'ChefPax Production System',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      if (completionNotes) {
        message.attachments![0].fields!.push({
          title: 'Completion Notes',
          value: completionNotes,
          short: false
        });
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending task completion notification:', error);
      return false;
    }
  }

  static async sendDailySummary(summary: {
    todayTasks: number;
    urgentTasks: number;
    overdueTasks: number;
    completedToday: number;
  }): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    try {
      const message: SlackMessage = {
        channel: this.channel,
        text: '📊 Daily Production Summary',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*📊 Daily Production Summary - ${new Date().toLocaleDateString()}*`
            }
          },
          {
            type: 'section',
            fields: [
              {
                title: 'Today\'s Tasks',
                value: summary.todayTasks.toString(),
                short: true
              },
              {
                title: 'Urgent Tasks',
                value: summary.urgentTasks.toString(),
                short: true
              },
              {
                title: 'Overdue Tasks',
                value: summary.overdueTasks.toString(),
                short: true
              },
              {
                title: 'Completed Today',
                value: summary.completedToday.toString(),
                short: true
              }
            ]
          }
        ]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending daily summary:', error);
      return false;
    }
  }

  static async sendUrgentAlert(task: any): Promise<boolean> {
    if (!this.webhookUrl) {
      return false;
    }

    try {
      const emoji = this.getTaskEmoji(task.type);
      
      const message: SlackMessage = {
        channel: this.channel,
        text: `🚨 URGENT: ${task.type} task is overdue!`,
        attachments: [
          {
            color: 'danger',
            title: `🚨 URGENT: ${task.type} Task Overdue`,
            text: `This task was scheduled for ${new Date(task.runAt).toLocaleString()} and needs immediate attention!`,
            fields: [
              {
                title: 'Product',
                value: task.productId,
                short: true
              },
              {
                title: 'Quantity',
                value: `${task.quantity} trays`,
                short: true
              },
              {
                title: 'Priority',
                value: task.priority,
                short: true
              },
              {
                title: 'Notes',
                value: task.notes || 'No additional notes',
                short: false
              }
            ],
            footer: 'ChefPax Production System - URGENT',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending urgent alert:', error);
      return false;
    }
  }

  private static getTaskEmoji(type: string): string {
    switch (type) {
      case 'SEED': return '🌱';
      case 'GERMINATE': return '🌿';
      case 'LIGHT': return '☀️';
      case 'HARVEST': return '✂️';
      case 'PACK': return '📦';
      default: return '📋';
    }
  }

  private static getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT': return 'danger';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'good';
      case 'LOW': return '#439FE0';
      default: return '#439FE0';
    }
  }
}
