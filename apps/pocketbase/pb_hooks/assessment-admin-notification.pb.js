/// <reference path="../pb_data/types.d.ts" />
onRecordAfterCreateSuccess((e) => {
  const message = new MailerMessage({
    from: {
      address: $app.settings().meta.senderAddress,
      name: "iMigrate Solutions"
    },
    to: [{ address: "Contact@Imigratesolution.com" }],
    subject: "New Assessment Lead Submission",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">iMigrate Solutions</h1>
          <p style="margin: 5px 0 0 0;">Admin Notification</p>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2 style="color: #003366;">New Assessment Lead Submission</h2>
          <p>A new assessment lead has been submitted. Here are the details:</p>
          
          <div style="background-color: white; padding: 20px; border-left: 4px solid #003366; margin: 20px 0;">
            <h3 style="color: #003366; margin-top: 0;">Lead Information:</h3>
            <p><strong>Name:</strong> ${e.record.get("fullName")}</p>
            <p><strong>Email:</strong> ${e.record.get("email")}</p>
            <p><strong>Phone:</strong> ${e.record.get("phone")}</p>
            <p><strong>Country of Citizenship:</strong> ${e.record.get("countryOfCitizenship") || "Not specified"}</p>
            <p><strong>Current Country:</strong> ${e.record.get("currentCountry") || "Not specified"}</p>
            <p><strong>Preferred Destination:</strong> ${e.record.get("preferredDestination") || "Not specified"}</p>
            <p><strong>Occupation:</strong> ${e.record.get("occupation") || "Not specified"}</p>
            <p><strong>Education Level:</strong> ${e.record.get("educationLevel") || "Not specified"}</p>
            <p><strong>Years of Experience:</strong> ${e.record.get("yearsOfExperience") || "Not specified"}</p>
            <p><strong>Investment Funds:</strong> ${e.record.get("investmentFunds") || "Not specified"}</p>
            <p><strong>Program Interest:</strong> ${e.record.get("programInterest") || "Not specified"}</p>
            <p><strong>Message:</strong> ${e.record.get("message") || "No message provided"}</p>
            <p><strong>Submitted At:</strong> ${e.record.get("submittedAt")}</p>
          </div>
          
          <p style="margin-top: 20px;">
            <a href="https://your-admin-panel.com/leads/${e.record.id}" style="background-color: #003366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Admin Panel</a>
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
}, "leads");