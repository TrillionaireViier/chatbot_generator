import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check DB connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', db: 'disconnected' });
  }
});

// Basic structure for webhook routing
app.post('/webhook/:channelType/:botId', (req: Request, res: Response) => {
  const { channelType, botId } = req.params;
  const payload = req.body;

  console.log(`[Webhook Received] Channel: ${channelType}, Bot: ${botId}`);
  // Normalization logic and message queueing goes here
  
  res.status(200).send('OK');
});

app.listen(port, () => {
  console.log(`🚀 Chatbot Generator Backend running on port ${port}`);
});
