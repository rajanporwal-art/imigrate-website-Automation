/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: "iMigrate Solutions"
    },
    to: [{ address: e.record.get("email") }],
    subject: "We Received Your Inquiry - iMigrate Solutions",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">iMigrate Solutions</h1>
          <p style="margin: 5px 0 0 0;">Your Immigration Partner</p>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #003366;">Inquiry Received</h2>
          <p>Dear <strong>${e.record.get("fullName")}</strong>,</p>
          <p>Thank you for reaching out to iMigrate Solutions. We have received your inquiry and appreciate your interest in our services.</p>
          
          <div style="background-color: white; padding: 20px; border-left: 4px solid #003366; margin: 20px 0;">
            <h3 style="color: #003366; margin-top: 0;">Your Inquiry Details:</h3>
            <p><strong>Name:</strong> ${e.record.get("fullName")}</p>
            <p><strong>Email:</strong> ${e.record.get("email")}</p>
            <p><strong>Phone:</strong> ${e.record.get("phone")}</p>
            <p><strong>Subject:</strong> ${e.record.get("subject")}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: #f0f0f0; padding: 10px; border-radius: 4px;">${e.record.get("message")}</p>
          </div>
          
          <p>Our team will review your inquiry and get back to you as soon as possible, typically within 24 hours.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            For urgent matters, please contact us directly at Contact@Imigratesolution.com
          </p>
        </div>
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 iMigrate Solutions. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">Your trusted immigration consulting partner</p>
        </div>
      </div>
    `
  });
  $app.newMailClient().send(message);
  e.next();
}, "inquiries");