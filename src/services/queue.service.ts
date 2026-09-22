import { Queue, Worker, Job } from 'bullmq';
import { UnifiedMessage } from '../core/normalizer';
import { BotService } from '../modules/bot/bot.service';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const messageQueue = new Queue('incoming_messages', { connection });

// Initialize the worker that processes incoming messages
export const messageWorker = new Worker('incoming_messages', async (job: Job) => {
  const messageData: UnifiedMessage = job.data;
  console.log(`[Queue] Processing message for Bot ${messageData.botId} from ${messageData.senderId}`);
  
  const botService = new BotService();
  await botService.handleIncomingMessage(messageData);
}, { connection });

messageWorker.on('completed', (job) => {
  console.log(`[Queue] Job ${job.id} completed successfully`);
});

messageWorker.on('failed', (job, err) => {
  console.error(`[Queue] Job ${job?.id} failed with error: ${err.message}`);
});
