import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

export interface TelegramCredentials {
  token?: string;
  chatId?: string;
}

export interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    date: number;
    text: string;
  };
  error_code?: number;
  description?: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly telegramApiUrl = 'https://api.telegram.org/bot';

  async sendMessage(
    data: { name: string; email: string; message: string },
    credentials?: TelegramCredentials
  ): Promise<void> {
    try {
      const token = credentials?.token || process.env.TELEGRAM_BOT_TOKEN;
      const chatId = credentials?.chatId || process.env.TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        throw new BadRequestException('Token de Telegram o Chat ID no configurados');
      }

      const message = this.generateTelegramMessage(data);

      const response: AxiosResponse<TelegramResponse> = await axios.post(
        `${this.telegramApiUrl}${token}/sendMessage`,
        {
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        },
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.ok) {
        this.logger.log(`📱 Mensaje de Telegram enviado exitosamente - ID: ${response.data.result?.message_id}`);
      } else {
        throw new Error(`Telegram API error: ${response.data.description}`);
      }
    } catch (error) {
      this.logger.error(`❌ Error enviando mensaje de Telegram: ${error.message}`);
      throw new BadRequestException(`Error enviando mensaje de Telegram: ${error.message}`);
    }
  }

  private generateTelegramMessage(data: { name: string; email: string; message: string }): string {
    const timestamp = new Date().toLocaleString('es-ES');
    
    return `
🔔 <b>Nueva Notificación</b>

👤 <b>Nombre:</b> ${this.escapeHtml(data.name)}
📧 <b>Email:</b> <a href="mailto:${data.email}">${data.email}</a>

💬 <b>Mensaje:</b>
<i>${this.escapeHtml(data.message)}</i>

━━━━━━━━━━━━━━━━━━━━
⏰ ${timestamp}
🤖 Sistema de Notificaciones
    `.trim();
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async getBotInfo(token?: string): Promise<any> {
    try {
      const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        throw new BadRequestException('Token de Telegram no configurado');
      }

      const response = await axios.get(`${this.telegramApiUrl}${botToken}/getMe`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error obteniendo información del bot: ${error.message}`);
      throw new BadRequestException(`Error obteniendo información del bot: ${error.message}`);
    }
  }
}
