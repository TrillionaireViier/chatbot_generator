import { ChannelType } from '@prisma/client';
import { WebhookAdapter, UnifiedMessage } from '../../core/normalizer';

export class ViberAdapter extends WebhookAdapter {
  constructor() {
    super(ChannelType.VIBER);
  }

  normalize(payload: any, botId: string): UnifiedMessage | null {
    // Example Viber payload: { event: "message", sender: { id: "01234567890A=" }, message: { text: "Hello" }, timestamp: 1612345678000 }
    if (payload.event !== 'message' || !payload.message || !payload.message.text) {
      return null;
    }

    return {
      botId,
      channelType: this.channelType,
      senderId: payload.sender.id,
      content: payload.message.text,
      timestamp: new Date(payload.timestamp),
      metadata: { originalPayload: payload }
    };
  }

  async sendMessage(botId: string, recipientId: string, content: string): Promise<boolean> {
    // Logic to send a message via Viber API using the bot's stored token
    console.log(`[Viber] Sending message to ${recipientId} via Bot ${botId}: ${content}`);
    // Simulate HTTP request
    return true;
  }
}
