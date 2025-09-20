import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  async sendMessage(data: { name: string; email: string; message: string }) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      this.logger.warn('⚠️ Telegram no configurado');
      return;
    }

    const text = `📬 Nuevo contacto en tu portfolio\n` +
      `Nombre: ${data.name}\nEmail: ${data.email}\nMensaje: ${data.message}`;

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text,
    });

    this.logger.log(`📲 Mensaje enviado a Telegram de ${data.email}`);
  }
}
