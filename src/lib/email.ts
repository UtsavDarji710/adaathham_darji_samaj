import nodemailer from "nodemailer";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  fromEmail: string;
  fromName: string;
}

const getSmtpConfig = (): SmtpConfig | null => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASSWORD?.trim();
  const pass = rawPass ? rawPass.replace(/\s+/g, "") : "";
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || user || "noreply@adaadhamsamaj.org";
  const fromName = process.env.SMTP_FROM_NAME?.trim() || "શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા";

  if (!host || !user || !pass) {
    return null;
  }

  return { host, port, secure, auth: { user, pass }, fromEmail, fromName };
};

/**
 * Generate a responsive HTML OTP email template with Gujarati & English branding.
 */
export const generateOtpEmailHtml = (otp: string, recipientName?: string): string => {
  return `<!DOCTYPE html>
<html lang="gu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your OTP Verification Code – Adaatham Darji Seva Samiti</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FDFBF7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1F2937;
    }
    .wrapper {
      width: 100%;
      background-color: #FDFBF7;
      padding: 30px 15px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #E5E7EB;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #D97706 0%, #B45309 100%);
      padding: 24px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.3px;
    }
    .header p {
      margin: 6px 0 0;
      font-size: 13px;
      opacity: 0.95;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #1F2937;
      margin-bottom: 12px;
    }
    .intro {
      font-size: 14px;
      line-height: 1.6;
      color: #4B5563;
      margin-bottom: 24px;
    }
    .otp-box {
      background: #FFFBEB;
      border: 2px dashed #D97706;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #92400E;
      margin-bottom: 6px;
    }
    .otp-code {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #B45309;
      font-family: 'Courier New', Courier, monospace;
      margin: 6px 0;
      display: inline-block;
    }
    .otp-expiry {
      font-size: 12px;
      color: #B45309;
      margin-top: 6px;
      font-weight: 500;
    }
    .warning-box {
      background-color: #FEF2F2;
      border-left: 4px solid #DC2626;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 20px 0;
      font-size: 12px;
      line-height: 1.5;
      color: #991B1B;
    }
    .footer {
      background-color: #F9FAFB;
      border-top: 1px solid #E5E7EB;
      padding: 20px 24px;
      text-align: center;
      font-size: 11px;
      color: #6B7280;
      line-height: 1.5;
    }
    .footer p {
      margin: 4px 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા</h1>
        <p>Adaatham Darji Seva Samiti — Official Verification</p>
      </div>
      <div class="content">
        <p class="greeting">નમસ્કાર ${recipientName ? recipientName : "સભ્યશ્રી"},</p>
        <p class="intro">
          અડાઆઠમ દરજી સેવા સમિતિ પોર્ટલ પર આપના ખાતાની ચકાસણી (Verification) માટે આપનો ૬-આંકડાનો સુરક્ષિત OTP નીચે મુજબ છે:
        </p>

        <div class="otp-box">
          <div class="otp-label">ઓટીપી વેરિફિકેશન કોડ (OTP Verification Code)</div>
          <div class="otp-code">${otp}</div>
          <div class="otp-expiry">⏱️ આ કોડ ફક્ત ૫ મિનિટ (5 Minutes) માટે માન્ય છે.</div>
        </div>

        <div class="warning-box">
          <strong>⚠️ સુરક્ષા સૂચના (Security Alert):</strong><br>
          આ ઓટીપી કોડ કોઈ પણ વ્યક્તિ સાથે શેર કરશો નહીં. અડાઆઠમ દરજી સેવા સમિતિના કોઈપણ પ્રતિનિધિ ક્યારેય આપની પાસે ઓટીપી માંગશે નહીં. જો આપે આ ઓટીપી માટે વિનંતી નથી કરી, તો કૃપા કરીને આ ઈમેઈલને અવગણો.
        </div>

        <p style="font-size: 13px; color: #6B7280; margin-top: 24px; line-height: 1.5;">
          સાદર,<br>
          <strong>કારોબારી સમિતિ</strong><br>
          શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા
        </p>
      </div>

      <div class="footer">
        <p>આ એક સ્વચાલિત ઈમેઈલ છે, કૃપા કરીને આ ઈમેઈલનો જવાબ આપશો નહીં.</p>
        <p>© ${new Date().getFullYear()} શ્રી અડાઆઠમ દરજી સેવા સમિતિ. સર્વાધિકાર સુરક્ષિત.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Send OTP via Nodemailer with local fallback when SMTP is not yet configured.
 */
export async function sendOtpEmail(
  email: string,
  otp: string,
  name?: string
): Promise<{ success: boolean; message: string; previewMode?: boolean }> {
  const config = getSmtpConfig();

  if (!config) {
    // Graceful development mode fallback
    console.log("=================================================");
    console.log(`[SMTP DEV FALLBACK] To: ${email}`);
    console.log(`[SMTP DEV FALLBACK] OTP Code: ${otp}`);
    console.log(`[SMTP DEV FALLBACK] Expiry: 5 minutes`);
    console.log("=================================================");
    return {
      success: true,
      message: `ઓટીપી સફળતાપૂર્વક મોકલવામાં આવ્યો છે (Dev Mode: ${otp})`,
      previewMode: true,
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    const mailOptions = {
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: email,
      subject: "Your OTP Verification Code – Adaatham Darji Seva Samiti",
      text: `Your OTP for Adaatham Darji Seva Samiti is: ${otp}. It will expire in 5 minutes. Do not share it with anyone.`,
      html: generateOtpEmailHtml(otp, name),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] OTP Email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return {
      success: true,
      message: "ઓટીપી સફળતાપૂર્વક આપના ઈમેઈલ પર મોકલવામાં આવ્યો છે.",
    };
  } catch (error: any) {
    console.error("[Nodemailer Error]", error);
    return {
      success: false,
      message: error?.message || "ઈમેઈલ મોકલવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.",
    };
  }
}

/**
 * Send general transactional notification emails (Donation status, Ad approval, etc.)
 */
export async function sendNotificationEmail(
  email: string,
  subject: string,
  title: string,
  messageBody: string,
  recipientName?: string
): Promise<{ success: boolean; message: string }> {
  const config = getSmtpConfig();

  if (!config) {
    console.log(`[SMTP DEV NOTIFICATION] To: ${email} | Subject: ${subject}`);
    return { success: true, message: "સૂચના ઈમેઈલ નોંધાયો (Dev Mode)" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });

    const html = `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif; background:#FDFBF7; padding:20px; color:#1F2937;">
  <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:12px; padding:24px; border:1px solid #E5E7EB;">
    <h2 style="color:#D97706; margin-top:0;">શ્રી અડાઆઠમ દરજી સેવા સમિતિ</h2>
    <p>નમસ્કાર ${recipientName || "સભ્યશ્રી"},</p>
    <h3 style="color:#111827;">${title}</h3>
    <div style="background:#F9FAFB; padding:16px; border-radius:8px; line-height:1.6; margin:16px 0;">
      ${messageBody}
    </div>
    <p style="font-size:12px; color:#6B7280; margin-top:20px;">
      શ્રી અડાઆઠમ દરજી સેવા સમિતિ, મોડાસા
    </p>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: email,
      subject,
      text: `${title}\n\n${messageBody}`,
      html,
    });

    return { success: true, message: "સૂચના ઈમેઈલ મોકલવામાં આવ્યો." };
  } catch (error: any) {
    console.error("[Nodemailer Notification Error]", error);
    return { success: false, message: error?.message || "Error sending email notification." };
  }
}

