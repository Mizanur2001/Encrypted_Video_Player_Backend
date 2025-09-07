exports.otpMailTemplate = (name, otp) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Encrypted Video Player — OTP</title>
  <style>
    :root{
      --bg:#0f1724;
      --card:#0b1220;
      --accent:#6EE7B7;
      --accent-2:#60A5FA;
      --muted:#9CA3AF;
      --white: #ffffff;
      --otp-bg: linear-gradient(90deg,#111827 0%, #0f1724 100%);
      --radius:14px;
      font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial;
    }
    /* Email client safe reset */
    body{margin:0;padding:0;background:#f3f4f6;}
    .email-wrap{max-width:680px;margin:28px auto;padding:24px;}
    .card{
      background: linear-gradient(180deg, #0f1724 0%, #071027 100%);
      color:var(--white);
      border-radius:var(--radius);
      box-shadow:0 12px 40px rgba(2,6,23,0.6);
      overflow:hidden;
    }
    .panel{
      padding:28px 32px;
      text-align:center;
    }
    .brand{
      display:flex;align-items:center;gap:12px;justify-content:center;margin-bottom:6px;
    }
    .logo-badge{
      width:56px;height:56px;border-radius:12px;
      background:linear-gradient(135deg,var(--accent),var(--accent-2));
      display:inline-flex;align-items:center;justify-content:center;
      font-weight:700;color:#07203a;font-size:20px;
      box-shadow:0 6px 18px rgba(96,165,250,0.18), inset 0 -6px 12px rgba(0,0,0,0.12);
    }
    .app-name{font-size:18px;font-weight:700;letter-spacing:0.2px;}
    .headline{font-size:20px;margin:12px 0;color:var(--white);font-weight:700;}
    .subtitle{color:var(--muted);font-size:14px;margin-bottom:18px;line-height:1.45;}
    .otp{
      display:inline-block;
      margin:18px auto;
      padding:14px 28px;
      border-radius:10px;
      background:linear-gradient(90deg,#0b1220,#071027);
      border:1px solid rgba(255,255,255,0.06);
      font-family: 'Courier New', Courier, monospace;
      font-size:30px;
      letter-spacing:6px;
      color:var(--accent);
      font-weight:700;
    }
    .cta{
      display:inline-block;
      margin-top:18px;
      padding:10px 18px;
      background:linear-gradient(90deg,var(--accent),var(--accent-2));
      color:#07203a;
      border-radius:10px;
      text-decoration:none;
      font-weight:700;
      box-shadow:0 8px 28px rgba(96,165,250,0.14);
    }
    .meta{
      color:var(--muted);
      font-size:13px;
      margin-top:20px;
      line-height:1.5;
    }
    .footer{
      padding:18px 22px;
      background:linear-gradient(180deg, rgba(255,255,255,0.02), transparent);
      color:var(--muted);
      font-size:12px;
      text-align:center;
    }
    a{color:inherit;}
    /* Mobile adjustments */
    @media only screen and (max-width:480px){
      .email-wrap{padding:12px;}
      .panel{padding:20px;}
      .otp{font-size:26px;padding:12px 20px;}
    }
  </style>
</head>
<body>
  <div class="email-wrap" role="article" aria-roledescription="email" aria-label="Encrypted Video Player OTP">
    <div class="card" role="presentation">
      <div class="panel">
        <div class="brand" role="img" aria-label="Encrypted Video Player logo">
          <div class="logo-badge">EV</div>
          <div>
            <div class="app-name">Encrypted Video Player</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px;">Securely stream your encrypted media</div>
          </div>
        </div>

        <div class="headline">Password Reset — One‑Time Passcode</div>

        <div class="subtitle">
          Hi ${name || 'there'},<br/>
          We received a request to reset your password. Use the one‑time passcode below to verify your identity. This code is valid for 3 minutes.
        </div>

        <div class="otp" aria-label="One time password">${otp}</div>

        <div>
          <a class="cta" href="https://video.mizanur.in" target="_blank" rel="noopener">Open Encrypted Video Player</a>
        </div>

        <div class="meta">
          If you did not request a password reset, please ignore this email or secure your account. Do not share this code with anyone.
        </div>
      </div>

      <div class="footer">
        Encrypted Video Player • Keeping your media private and secure<br/>
        <span style="color:#6b7280">Need help? <a href="mailto:dev@mizanur.in">dev@mizanur.in</a></span>
      </div>
    </div>
  </div>
</body>
</html>`;
};