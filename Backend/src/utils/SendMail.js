import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.APP_PASSWORD,
    },
});

// Wraps whatever content is passed in a styled shell — table-based layout
// with inline styles, since most email clients (Outlook especially) don't
// support flexbox/grid or external stylesheets reliably.
const buildEmailHTML = (subject, bodyContent) => {
    return `
    <div style="background-color:#f4f4f7; padding:32px 16px; font-family:'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e5e5ea;">

            <!-- Header -->
            <tr>
                <td style="background:#7c6cf0; padding:24px 32px;">
                    <p style="margin:0; font-size:13px; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.75); font-weight:600;">
                        Notification
                    </p>
                    <h1 style="margin:8px 0 0; font-size:20px; color:#ffffff; font-weight:700;">
                        ${subject}
                    </h1>
                </td>
            </tr>

            <!-- Body -->
            <tr>
                <td style="padding:28px 32px; font-size:14px; line-height:1.6; color:#3c3c43;">
                    ${bodyContent}
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="padding:18px 32px; background:#fafafc; border-top:1px solid #f0f0f2;">
                    <p style="margin:0; font-size:12px; color:#a1a1a6;">
                        This is an automated email — please do not reply directly unless instructed.
                    </p>
                </td>
            </tr>

        </table>
    </div>
    `;
};

const sendMail = async (to, subject, Message) => {
    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: [to],
        subject: subject,
        html: buildEmailHTML(subject, Message),
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent succesfully");
        return true;
    } catch (error) {
        console.log("Error while sending  email", error);
        return false;
    }
};

export { sendMail };