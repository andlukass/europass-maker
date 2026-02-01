import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import { validateConfig } from './model.js';
import { generateHtml } from './render/html.js';
import { generatePdf } from './render/pdf.js';
import fs from 'fs';
import path from 'path';

// Basic configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const port = process.env.PORT || 3000;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
  process.exit(1);
}

// Initialize Telegram Bot
const bot = new TelegramBot(token, { polling: true });

const isJson = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Handle photo messages
  if (msg.photo) {
    try {
      const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution
      const file = await bot.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      
      const chatDir = path.join(process.cwd(), 'chats', String(chatId));
      if (!fs.existsSync(chatDir)) {
        fs.mkdirSync(chatDir, { recursive: true });
      }

      // We'll save it as photo.jpg for simplicity, or keep original extension
      const ext = path.extname(file.file_path || '.jpg');
      const photoPath = path.join(chatDir, `photo${ext}`);
      
      // Remove any existing photos with different extensions first to avoid confusion
      const files = fs.readdirSync(chatDir);
      files.forEach(f => {
        if (f.startsWith('photo.')) {
          fs.unlinkSync(path.join(chatDir, f));
        }
      });

      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(photoPath, Buffer.from(buffer));

      bot.sendMessage(chatId, 'Foto salva com sucesso!');
      return;
    } catch (error) {
      console.error('Error saving photo:', error);
      bot.sendMessage(chatId, 'Erro ao salvar a foto.');
      return;
    }
  }

  if (!text) return;

  if (!isJson(text)) {
    bot.sendMessage(chatId, 'o bot so recebe json do tipo CvConfig');
    return;
  }

  const config = JSON.parse(text);

  if (!validateConfig(config)) {
    bot.sendMessage(chatId, 'o fomrato do json esta invalido');
    return;
  }

  try {
    // Look for a photo in the chat directory
    const chatDir = path.join(process.cwd(), 'chats', String(chatId));
    let photoPath: string | undefined;
    
    if (fs.existsSync(chatDir)) {
      const files = fs.readdirSync(chatDir);
      const photoFile = files.find(f => f.startsWith('photo.'));
      if (photoFile) {
        photoPath = path.join(chatDir, photoFile);
      }
    }

    const html = generateHtml(config, photoPath);
    const outputPath = path.join(process.cwd(), `cv-${chatId}.pdf`);
    await generatePdf(html, outputPath);
    
    await bot.sendDocument(chatId, outputPath);
    
    // Clean up the generated file
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  } catch (error) {
    console.error('Error generating or sending PDF:', error);
    bot.sendMessage(chatId, 'Ocorreu um erro ao gerar o seu PDF. Tente novamente mais tarde.');
  }
});

console.log('Bot is running in polling mode...');

// Health check server for Render
const app = express();

app.get('/', (_req, res) => {
  res.send('Bot is alive! 🤖');
});

app.listen(port, () => {
  console.log(`Health check server listening on port ${port}`);
});
