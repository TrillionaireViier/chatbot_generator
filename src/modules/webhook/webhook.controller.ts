import type { Request, Response } from 'express';
import { ChannelType, PrismaClient } from '@prisma/client';
import { TelegramAdapter } from '../channels/telegram.adapter';
import { ViberAdapter } from '../channels/viber.adapter';
import { messageQueue } from '../../services/queue.service';

const prisma = new PrismaClient();

export class WebhookController {
  
  static async handleIncomingWebhook(req: Request, res: Response) {
    const { channelType, botId } = req.params;
    const payload = req.body;

    try {
      // 1. Verify that the bot and channel exist
      const channel = await prisma.channel.findUnique({
        where: {
          type_botId: {
            type: channelType as ChannelType,
            botId: botId
          }
        }
      });

      if (!channel || !channel.isActive) {
        return res.status(404).json({ error: 'Channel not found or inactive for this bot.' });
      }

      // 2. Select the correct adapter
      let adapter;
      switch (channelType.toUpperCase()) {
        case ChannelType.TELEGRAM:
          adapter = new TelegramAdapter();
          break;
        case ChannelType.VIBER:
          adapter = new ViberAdapter();
          break;
        default:
          return res.status(400).json({ error: 'Unsupported channel type' });
      }

      // 3. Normalize the incoming payload
      const unifiedMessage = adapter.normalize(payload, botId);
      
      if (!unifiedMessage) {
        // Not a valid message payload (could be typing indicator, read receipt, etc.)
        return res.status(200).send('Ignored');
      }

      // 4. Push to Redis Queue for reliable processing
      await messageQueue.add('process_message', unifiedMessage, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      });

      // Acknowledge receipt to the platform immediately
      res.status(200).send('OK');

    } catch (error) {
      console.error(`[WebhookController] Error processing webhook:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
