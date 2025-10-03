import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Resend } from 'resend';

export interface EmailCredentials {
  resendKey?: string;
  to?: string;
  from?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  async sendMail(
    data: { name: string; email: string; message: string },
    credentials?: EmailCredentials
  ): Promise<void> {
    try {
      const resendKey = credentials?.resendKey || process.env.RESEND_KEY;
      const recipientEmail = credentials?.to || process.env.MAIL_TO;
      const senderEmail = credentials?.from || process.env.MAIL_FROM || 'onboarding@resend.dev';

      if (!resendKey) {
        throw new BadRequestException('Resend API key no configurada');
      }

      if (!recipientEmail) {
        throw new BadRequestException('Email destinatario no configurado');
      }

      const resend = new Resend(resendKey);

      const htmlTemplate = this.generateEmailTemplate(data);
      const textTemplate = this.generateTextTemplate(data);

      const result = await resend.emails.send({
        from: senderEmail,
        to: [recipientEmail],
        subject: `Notificación de ${data.name}`,
        html: htmlTemplate,
        text: textTemplate,
        replyTo: data.email,
      });

      this.logger.log(`📧 Email enviado exitosamente a ${recipientEmail} - ID: ${result.data?.id}`);
    } catch (error) {
      this.logger.error(`❌ Error enviando email: ${error.message}`);
      throw new BadRequestException(`Error enviando email: ${error.message}`);
    }
  }

  private generateEmailTemplate(data: { name: string; email: string; message: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nueva Notificación</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🔔 Nueva Notificación</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #495057; margin-top: 0;">Detalles del Contacto</h2>
              <p><strong>👤 Nombre:</strong> ${data.name}</p>
              <p><strong>📧 Email:</strong> <a href="mailto:${data.email}" style="color: #007bff; text-decoration: none;">${data.email}</a></p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #495057; margin-top: 0;">💬 Mensaje</h3>
              <blockquote style="margin: 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #007bff; border-radius: 4px; font-style: italic;">
                ${data.message.replace(/\n/g, '<br>')}
              </blockquote>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6c757d; font-size: 14px;">
            <p>Este correo fue enviado automáticamente desde el sistema de notificaciones.</p>
            <p>📅 ${new Date().toLocaleString('es-ES')}</p>
          </div>
        </body>
      </html>
    `;
  }

  private generateTextTemplate(data: { name: string; email: string; message: string }): string {
    return `
Nueva Notificación
==================

Detalles del Contacto:
- Nombre: ${data.name}
- Email: ${data.email}

Mensaje:
--------
${data.message}

---
Este correo fue enviado automáticamente desde el sistema de notificaciones.
Fecha: ${new Date().toLocaleString('es-ES')}
    `.trim();
  }
}