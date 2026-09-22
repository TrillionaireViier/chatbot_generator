import { PrismaClient, ChannelType } from '@prisma/client';
import { UnifiedMessage } from '../../core/normalizer';
import { TelegramAdapter } from '../channels/telegram.adapter';
import { ViberAdapter } from '../channels/viber.adapter';

const prisma = new PrismaClient();

export class BotService {
  /**
   * Main entry point for processing an incoming message.
   */
  async handleIncomingMessage(message: UnifiedMessage) {
    // 1. Save incoming message to DB
    await this.saveMessage(message, false);

    // 2. Generate AI Response (Mock OpenAI implementation)
    const replyContent = await this.generateAIResponse(message.content);

    // 3. Send response back to the correct channel
    const success = await this.sendReply(message.botId, message.channelType, message.senderId, replyContent);

    // 4. Save outgoing message to DB if successful
    if (success) {
      await this.saveMessage({
        ...message,
        content: replyContent,
        timestamp: new Date()
      }, true);
      
      // Update Analytics
      await this.updateAnalytics(message.botId);
    }
  }

  /**
   * Mock AI Generation - replace with real OpenAI/LLM call
   */
  private async generateAIResponse(userText: string): Promise<string> {
    // Basic Echo logic for demonstration
    return `[Mock AI] You said: "${userText}". How can I assist you further?`;
  }

  /**
   * Save message to unified history
   */
  private async saveMessage(message: UnifiedMessage, isOutgoing: boolean) {
    try {
      await prisma.message.create({
        data: {
          botId: message.botId,
          channelType: message.channelType,
          senderId: message.senderId,
          content: message.content,
          isOutgoing: isOutgoing
        }
      });
    } catch (e) {
      console.error(`[BotService] Error saving message:`, e);
    }
  }

  /**
   * Route the outgoing message through the appropriate adapter
   */
  private async sendReply(botId: string, channelType: ChannelType, recipientId: string, content: string): Promise<boolean> {
    let adapter;
    switch (channelType) {
      case ChannelType.TELEGRAM:
        adapter = new TelegramAdapter();
        break;
      case ChannelType.VIBER:
        adapter = new ViberAdapter();
        break;
      default:
        console.error(`[BotService] Unsupported channel type: ${channelType}`);
        return false;
    }
    
    return await adapter.sendMessage(botId, recipientId, content);
  }

  /**
   * Update simple analytics
   */
  private async updateAnalytics(botId: string) {
    try {
      await prisma.analytics.upsert({
        where: { botId },
        update: { totalMessages: { increment: 1 } },
        create: { botId, totalMessages: 1, totalUsers: 1 }
      });
    } catch (e) {
      console.error(`[BotService] Error updating analytics:`, e);
    }
  }
}
