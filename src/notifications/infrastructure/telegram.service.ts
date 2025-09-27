import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  async sendMessage(
    data: { name: string; email: string; message: string },
    credentials: any
  ) {
    if (!credentials?.token || !credentials?.chatId) {
      this.logger.warn('⚠️ Telegram no configurado para este usuario');
      return;
    }

    const text = `📬 Nuevo contacto en tu portfolio\n` +
      `Nombre: ${data.name}\nEmail: ${data.email}\nMensaje: ${data.message}`;

    await axios.post(`https://api.telegram.org/bot${credentials.token}/sendMessage`, {
      chat_id: credentials.chatId,
      text,
    });

    this.logger.log(`📲 Mensaje enviado a Telegram de ${data.email}`);
  }
}
