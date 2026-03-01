async function getMSGraphToken(): Promise<string> {
  const tenantId = process.env.AUTH_AZURE_AD_TENANT_ID!;
  const clientId = process.env.AUTH_AZURE_AD_CLIENT_ID!;
  const clientSecret = process.env.AUTH_AZURE_AD_CLIENT_SECRET!;

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MS Graph token error: ${err}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
): Promise<void> {
  const accessToken = await getMSGraphToken();
  const sender = process.env.AZURE_EMAIL_SENDER!;
  const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  );
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#161b22;border-radius:12px;border:1px solid #21262d;">
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="color:#ffffff;margin:0 0 4px;font-size:22px;font-weight:700;">
                Shion AI
              </h1>
              <p style="color:#7d8590;margin:0 0 32px;font-size:13px;">
                AI powered research assistant
              </p>
              <h2 style="color:#ffffff;margin:0 0 12px;font-size:18px;font-weight:600;">
                Verify your email address
              </h2>
              <p style="color:#8b949e;margin:0 0 28px;font-size:14px;line-height:1.6;">
                Hi ${name},<br><br>
                Thanks for signing up! Click the button below to verify your
                email address and activate your account.
              </p>
              <a href="${verifyUrl}"
                style="display:inline-block;background:#1f6feb;color:#ffffff;
                       text-decoration:none;padding:12px 28px;border-radius:6px;
                       font-size:14px;font-weight:600;">
                Verify Email Address
              </a>
              <p style="color:#6e7681;margin:28px 0 0;font-size:12px;line-height:1.6;">
                This link expires in 24 hours. If you didn't create a Shion AI
                account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(sender)}/sendMail`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          subject: 'Verify your Shion AI account',
          body: { contentType: 'HTML', content: html },
          toRecipients: [{ emailAddress: { address: to } }],
        },
        saveToSentItems: false,
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to send verification email: ${err}`);
  }
}
