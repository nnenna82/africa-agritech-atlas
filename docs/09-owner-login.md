# Owner login (/admin)

The owner logs in at https://africa-agritech-atlas.vercel.app/admin with a code sent by email. There is no password.

## Why a code, not just a link

University and work email systems (such as Microsoft's) open every link in incoming email to check it is safe. A normal one-time login link is used up by that check before you click it, and you see "Email link is invalid or has expired". A code you type cannot be used up that way. The link in the email also no longer logs you in by itself: it opens the admin page with a **Log in** button, which security checks do not press.

## One-time setup in Supabase (about 3 minutes)

1. Go to supabase.com, open the **africa-agritech-atlas** project.
2. Go to **Authentication → Emails** (it may be called **Email Templates**), then open **Magic Link**.
3. Set **Subject** to:

   ```
   Your Africa AgriTech Atlas login code
   ```

4. Replace the whole **Body** (message) with:

   ```html
   <h2>Log in to the Africa AgriTech Atlas</h2>
   <p>Your login code is:</p>
   <p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
   <p>Type it on the admin page. It works once and expires after an hour.</p>
   <p>Or open <a href="{{ .SiteURL }}/admin?token_hash={{ .TokenHash }}&type=email">the admin page</a> and press "Log in".</p>
   <p>If you did not ask for this, you can ignore this email.</p>
   ```

5. Press **Save**.

This needs the Site URL from Phase 3 (Authentication → URL Configuration → Site URL = `https://africa-agritech-atlas.vercel.app`).

## Logging in

1. Open `/admin`, type your email, press **Email me a login code**.
2. Type the code from the email and press **Log in**. Or click the link in the email and press **Log in** on the page it opens.
3. The free email sender allows only a few emails per hour. If one does not arrive, wait a few minutes and check spam.
