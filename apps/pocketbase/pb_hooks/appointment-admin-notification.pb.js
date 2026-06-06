/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: "iMigrate Solutions"
    },
    to: [{ address: "Contact@Imigratesolution.com" }],
    subject: "New Appointment Booking",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">iMigrate Solutions</h1>
          <p style="margin: 5px 0 0 0;">Admin Notification</p>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #003366;">New Appointment Booking</h2>
          <p>A new appointment has been booked. Here are the details:</p>
          
          <div style="background-color: white; padding: 20px; border-left: 4px solid #003366; margin: 20px 0;">
            <h3 style="color: #003366; margin-top: 0;">Appointment Information:</h3>
            <p><strong>Name:</strong> ${e.record.get("fullName")}</p>
            <p><strong>Email:</strong> ${e.record.get("email")}</p>
            <p><strong>Phone:</strong> ${e.record.get("phone")}</p>
            <p><strong>Date:</strong> ${e.record.get("preferredDate")}</p>
            <p><strong>Time:</strong> ${e.record.get("preferredTime")}</p>
            <p><strong>Consultation Type:</strong> ${e.record.get("consultationType") || "Not specified"}</p>
            <p><strong>Status:</strong> <span style="background-color: #e8f4f8; padding: 4px 8px; border-radius: 4px; color: #003366;">${e.record.get("status") || "pending"}</span></p>
            ${e.record.get("notes") ? `<p><strong>Notes:</strong> ${e.record.get("notes")}</p>` : ""}
            <p><strong>Booked At:</strong> ${e.record.get("submittedAt")}</p>
          </div>
          
          <p style="margin-top: 20px;">
            <a href="https://your-admin-panel.com/appointments/${e.record.id}" style="background-color: #003366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Admin Panel</a>
          </p>
        </div>
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 iMigrate Solutions. All rights reserved.</p>
        </div>
      </div>
    `
  });
  $app.newMailClient().send(message);
  e.next();
}, "appointments");