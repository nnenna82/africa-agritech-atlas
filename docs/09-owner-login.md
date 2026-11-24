# Owner login (/admin)

The owner logs in at https://africa-agritech-atlas.vercel.app/admin with their email and a password they chose. Only the owner's account can review suggestions (the database checks the private `owners` table).

## Why a password

The owner's university email system opens every link in incoming email to check it is safe. That uses up one-time login links before the owner can click them ("Email link is invalid or has expired"). Supabase's free plan does not allow changing the login email to carry a code instead (that needs a custom email service, SMTP). A password avoids email altogether.

## First time: set your password

1. Log in once with the emailed link: on /admin, type your email and press **No password yet? Email me a login link**. Click the link in the email **straight away**, in the same browser.
2. On /admin, open **Set or change your password**, type a password of at least 12 characters twice, press **Save password**.
3. From then on, log in with email + password.

The password goes straight from the page to Supabase. It is never stored in the code or seen by Claude.

## Forgot the password

Use **Email me a login link** (click it quickly), then set a new password in **Set or change your password**.

## Login links that land on another page

`components/AuthRedirect.tsx` forwards any login link that opens another page of the site to /admin. A link to `/admin?token_hash=…` only logs in when the owner presses **Log in** (safe from email scanners), but the default Supabase email does not use that format.
