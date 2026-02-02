import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error(error.response?.body || error);
    throw new Error("Email could not be sent");
  }
};
