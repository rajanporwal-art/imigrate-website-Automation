/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: "iMigrate Solutions"
    },
    to: [{ address: e.record.get("email") }],
    subject: "Your Appointment Confirmation - iMigrate Solutions",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">iMigrate Solutions</h1>
          <p style="margin: 5px 0 0 0;">Your Immigration Partner</p>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #003366;">Appointment Confirmation</h2>
          <p>Dear <strong>${e.record.get("fullName")}</strong>,</p>
          <p>Your appointment with iMigrate Solutions has been confirmed. We look forward to discussing your immigration goals with you.</p>
          
          <div style="background-color: white; padding: 20px; border-left: 4px solid #003366; margin: 20px 0;">
            <h3 style="color: #003366; margin-top: 0;">Appointment Details:</h3>
            <p><strong>Name:</strong> ${e.record.get("fullName")}</p>
            <p><strong>Email:</strong> ${e.record.get("email")}</p>
            <p><strong>Phone:</strong> ${e.record.get("phone")}</p>
            <p><strong>Date:</strong> ${e.record.get("preferredDate")}</p>
            <p><strong>Time:</strong> ${e.record.get("preferredTime")}</p>
            <p><strong>Consultation Type:</strong> ${e.record.get("consultationType") || "Not specified"}</p>
            <p><strong>Status:</strong> <span style="background-color: #e8f4f8; padding: 4px 8px; border-radius: 4px; color: #003366;">${e.record.get("status") || "pending"}</span></p>
            ${e.record.get("notes") ? `<p><strong>Notes:</strong> ${e.record.get("notes")}</p>` : ""}
          </div>
          
          <p>If you need to reschedule or have any questions, please contact us at Contact@Imigratesolution.com or reply to this email.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            We're excited to help you with your immigration journey!
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
}, "appointments");