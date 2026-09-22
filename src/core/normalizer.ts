import { ChannelType } from '@prisma/client';

export interface UnifiedMessage {
  botId: string;
  channelType: ChannelType;
  senderId: string;
  content: string;
  timestamp: Date;
  metadata?: any;
}

export abstract class WebhookAdapter {
  protected channelType: ChannelType;

  constructor(channelType: ChannelType) {
    this.channelType = channelType;
  }

  /**
   * Normalizes an incoming webhook payload into a UnifiedMessage format.
   */
  abstract normalize(payload: any, botId: string): UnifiedMessage | null;

  /**
   * Sends a message back to the specific platform.
   */
  abstract sendMessage(botId: string, recipientId: string, content: string): Promise<boolean>;
}
