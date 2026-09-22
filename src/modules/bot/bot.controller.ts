import { Request, Response } from 'express';
import { PrismaClient, ChannelType } from '@prisma/client';

const prisma = new PrismaClient();

export class BotController {
  
  // POST /bots
  static async createBot(req: Request, res: Response) {
    try {
      const { name, description, ownerId } = req.body;
      const bot = await prisma.bot.create({
        data: { name, description, ownerId }
      });
      res.status(201).json(bot);
    } catch (e) {
      res.status(500).json({ error: 'Failed to create bot' });
    }
  }

  // GET /bots/:botId
  static async getBot(req: Request, res: Response) {
    try {
      const bot = await prisma.bot.findUnique({
        where: { id: req.params.botId },
        include: { channels: true, analytics: true }
      });
      if (!bot) return res.status(404).json({ error: 'Bot not found' });
      res.json(bot);
    } catch (e) {
      res.status(500).json({ error: 'Failed to get bot' });
    }
  }

  // POST /bots/:botId/channels
  static async addChannel(req: Request, res: Response) {
    try {
      const { type, token, webhookUrl } = req.body;
      const channel = await prisma.channel.create({
        data: {
          botId: req.params.botId,
          type: type as ChannelType,
          token,
          webhookUrl
        }
      });
      res.status(201).json(channel);
    } catch (e) {
      res.status(500).json({ error: 'Failed to add channel. Might already exist for this bot.' });
    }
  }
}
