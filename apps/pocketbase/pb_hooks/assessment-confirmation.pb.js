/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: "iMigrate Solutions"
    },
    to: [{ address: e.record.get("email") }],
    subject: "Your Assessment Submission - iMigrate Solutions",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">iMigrate Solutions</h1>
          <p style="margin: 5px 0 0 0;">Your Immigration Partner</p>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #003366;">Assessment Submission Received</h2>
          <p>Dear <strong>${e.record.get("fullName")}</strong>,</p>
          <p>Thank you for submitting your immigration assessment with iMigrate Solutions. We have received your information and will review it shortly.</p>
          
          <div style="background-color: white; padding: 20px; border-left: 4px solid #003366; margin: 20px 0;">
            <h3 style="color: #003366; margin-top: 0;">Your Submission Details:</h3>
            <p><strong>Name:</strong> ${e.record.get("fullName")}</p>
            <p><strong>Email:</strong> ${e.record.get("email")}</p>
            <p><strong>Phone:</strong> ${e.record.get("phone")}</p>
            <p><strong>Preferred Destination:</strong> ${e.record.get("preferredDestination") || "Not specified"}</p>
            <p><strong>Program Interest:</strong> ${e.record.get("programInterest") || "Not specified"}</p>
          </div>
          
          <p>Our immigration specialists will contact you within 24-48 hours to discuss your options and next steps.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions in the meantime, please don't hesitate to reach out to us at Contact@Imigratesolution.com
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
}, "leads");