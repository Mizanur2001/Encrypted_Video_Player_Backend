exports.otpMailTemplate = (name, otp) => {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Encrypted Video Player — OTP</title>
  <style>
    /* Basic reset for email clients */
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    a { color:inherit; text-decoration:none; }
    /* Hide preheader in email body */
    .preheader { display:none !important; visibility:hidden; opacity:0; color:transparent; height:0; width:0; font-size:0; line-height:0; }
    @media only screen and (max-width:480px){
      .container { width:100% !important; padding:12px !important; }
      .otp { font-size:24px !important; padding:12px 16px !important; letter-spacing:6px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;">
  <!-- Preheader (email preview) -->
  <div class="preheader">Your Encrypted Video Player one-time code: ${otp} — valid for 3 minutes.</div>

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" bgcolor="#f3f4f6" style="width:100%;background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <!-- Card -->
        <table class="container" width="680" cellpadding="0" cellspacing="0" role="presentation" style="width:680px;max-width:680px;background-color:#ffffff;border-radius:14px;box-shadow:0 8px 24px rgba(15,23,42,0.08);overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 18px 32px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f1724;">
              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <div style="display:inline-flex;align-items:center;gap:12px;">
                      <!-- VML gradient fallback for Outlook -->
                      <!--[if mso]>
                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:56px;v-text-anchor:middle;width:56px;" arcsize="12%" stroked="false" fillcolor="#60A5FA">
                          <v:fill type="gradient" color="#6EE7B7" color2="#60A5FA" angle="135" />
                          <w:anchorlock/>
                          <center style="color:#07203a;font-weight:700;font-size:18px;font-family:Arial,Helvetica,sans-serif;line-height:56px;display:inline-block;">EV</center>
                        </v:roundrect>
                      <![endif]-->

                      <!-- non-Outlook: use a small table cell for robust centering -->
                      <!--[if !mso]><!-- -->
                        <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;border-collapse:collapse;">
                          <tr>
                            <td width="56" height="56" align="center" valign="middle"
                                style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#6EE7B7,#60A5FA);background-color:#60A5FA;color:#07203a;font-weight:700;font-size:18px;line-height:18px;mso-line-height-rule:exactly;">
                              EV
                            </td>
                          </tr>
                        </table>
                      <!--<![endif]-->
                      <div style="text-align:left;display:inline-block;vertical-align:middle;margin-left:12px;">
                        <div style="font-size:18px;font-weight:700;color:#0f1724;">Encrypted Video Player</div>
                        <div style="font-size:12px;color:#64748b;margin-top:2px;">Securely stream your encrypted media</div>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Headline -->
              <div style="font-size:20px;font-weight:700;color:#0f1724;margin:12px 0 8px 0;">Login — One‑Time Passcode</div>

              <!-- Message -->
              <div style="font-size:14px;color:#475569;line-height:1.5;margin-bottom:18px;">
                Hi ${name || 'there'},<br/>
                We received a request to log you in. Use the code below to verify your identity. This code is valid for 3 minutes.
              </div>

              <!-- OTP block -->
              <div style="margin:18px 0;">
                <table cellpadding="0" cellspacing="0" role="presentation" align="center" style="margin:0 auto;">
                  <tr>
                    <td align="center" style="background-color:#0b1220;border-radius:10px;padding:14px 28px;border:1px solid rgba(0,0,0,0.06);">
                      <span class="otp" style="display:inline-block;font-family: 'Courier New', Courier, monospace;font-size:28px;letter-spacing:6px;color:#6EE7B7;font-weight:700;">${otp}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA -->
              <div style="margin-top:18px;">
                <a href="https://video.mizanur.in" target="_blank" rel="noopener" style="background-color:#6EE7B7;color:#07203a;padding:10px 18px;border-radius:10px;display:inline-block;font-weight:700;">Open Encrypted Video Player</a>
              </div>

              <!-- Meta -->
              <div style="color:#64748b;font-size:13px;margin-top:20px;line-height:1.5;">
                If you did not request for this, please ignore this email or secure your account. Do not share this code with anyone.
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:16px 22px;text-align:center;color:#94a3b8;font-size:12px;">
              Encrypted Video Player • Keeping your media private and secure<br/>
              Need help? <a href="mailto:dev@mizanur.in" style="color:#2563eb;text-decoration:underline;">dev@mizanur.in</a>
            </td>
          </tr>
        </table>
        <!-- /Card -->
      </td>
    </tr>
  </table>
</body>
</html>`;
};