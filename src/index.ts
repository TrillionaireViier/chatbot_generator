import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { WebhookController } from './modules/webhook/webhook.controller';
import { BotController } from './modules/bot/bot.controller';

// Only initialize queue worker if REDIS_HOST is set (prevents crash on Vercel without env vars)
if (process.env.REDIS_HOST) {
  require('./services/queue.service');
}

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Chatbot Generator Backend is running!');
});

// Healthcheck
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Bot CRUD Routes
app.post('/api/bots', BotController.createBot);
app.get('/api/bots/:botId', BotController.getBot);
app.post('/api/bots/:botId/channels', BotController.addChannel);

// Webhook Route
app.post('/webhook/:channelType/:botId', WebhookController.handleIncomingWebhook);

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Chatbot Generator Backend running on port ${port}`);
  });
}

export default app;
