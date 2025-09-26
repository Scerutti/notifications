import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || '465', 10),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(data: { name: string; email: string; message: string }) {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      subject: `Nuevo contacto de ${data.name}`,
      text: `Email: ${data.email}\n\nMensaje:\n${data.message}`,
    };

    await this.transporter.sendMail(mailOptions);
    this.logger.log(`📧 Mail enviado de ${data.email}`);
  }
}
