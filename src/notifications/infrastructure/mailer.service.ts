import { Injectable, Logger } from '@nestjs/common';
import {Resend} from "resend";
// import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  // private transporter: nodemailer.Transporter;

  constructor() {
    // this.transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   host: process.env.MAIL_HOST,
    //   port: parseInt(process.env.MAIL_PORT || '465', 10),
    //   secure: true,
    //   auth: {
    //     user: process.env.MAIL_USER,
    //     pass: process.env.MAIL_PASS,
    //   },
    // });
  }

  async sendMail(
    data: { name: string; email: string; message: string },
    credentials: any
  ) {
    const resendKey = credentials?.resendKey || process.env.RESEND_KEY;
    const resend = new Resend(resendKey);

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; padding: 16px; color: #333;">
        <h2 style="color:#444;">Nuevo mensaje desde el Portfolio</h2>
        <p><strong>Nombre:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Mensaje:</strong></p>
        <blockquote style="margin: 12px 0; padding: 12px; background: #f5f5f5; border-left: 4px solid #007bff;">
          ${data.message}
        </blockquote>
        <hr style="margin-top:20px;"/>
        <small>Este correo fue enviado automáticamente desde el formulario de contacto.</small>
      </div>
    `;

    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: [credentials?.to || process.env.MAIL_TO],
      subject: 'Portfolio - Nuevo mensaje',
      html: htmlTemplate,
    });

    // const mailOptions = {
    //   from: process.env.MAIL_USER,
    //   to: process.env.MAIL_TO,
    //   subject: `Nuevo contacto de ${data.name}`,
    //   text: `Email: ${data.email}\n\nMensaje:\n${data.message}`,
    // };

    // await this.transporter.sendMail(mailOptions);
    this.logger.log(`📧 Mail enviado de ${data.email}`);
  }
}
