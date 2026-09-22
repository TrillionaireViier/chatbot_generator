import { ChannelType } from '@prisma/client';
import { WebhookAdapter, UnifiedMessage } from '../../core/normalizer';

export class TelegramAdapter extends WebhookAdapter {
  constructor() {
    super(ChannelType.TELEGRAM);
  }

  normalize(payload: any, botId: string): UnifiedMessage | null {
    // Example Telegram payload: { message: { from: { id: 123 }, text: "Hello" }, date: 1612345678 }
    if (!payload || !payload.message || !payload.message.text) {
      return null;
    }

    return {
      botId,
      channelType: this.channelType,
      senderId: payload.message.from.id.toString(),
      content: payload.message.text,
      timestamp: new Date(payload.message.date * 1000),
      metadata: { originalPayload: payload }
    };
  }

  async sendMessage(botId: string, recipientId: string, content: string): Promise<boolean> {
    // Logic to send a message via Telegram Bot API using the bot's stored token
    console.log(`[Telegram] Sending message to ${recipientId} via Bot ${botId}: ${content}`);
    // Simulate HTTP request
    return true;
  }
}
