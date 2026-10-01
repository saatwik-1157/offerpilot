# Going live: the last steps

The site runs fully in **demo mode** with no keys. Each step below turns one
feature into the real thing, and each is independent: do them in any order.
All settings live in [`apps/web/js/config.js`](apps/web/js/config.js) unless noted.

| # | Feature | You need | Paste into |
|---|---|---|---|
| 1 | Real contact details ✅ done | your email + phone | `email`, `phone`, `contactHours` |
| 2 | Contact form and chat messages reach your inbox | free key from [web3forms.com](https://web3forms.com) | `formsKey` |
| 3 | Signups and messages saved online | a free [Supabase](https://supabase.com) project | `supabaseUrl`, `supabaseAnonKey` |
| 4 | Real payments | 3 Stripe Payment Links | `stripePublishableKey`, `stripeLinks` |
| 5 | Real AI-tailored resumes | an Anthropic API key | `.env` (never in `config.js`) |
| 6 | Permanent public link | GitHub Pages, Netlify or Vercel | see below |

## 1. Contact details
Already set to the real email and phone. To change them later, edit these three values. The footer, contact section and help chat all read these, so this is the only place to change them.

## 2. Contact form and chat delivery (Web3Forms)
1. On web3forms.com, enter the email that should receive messages. They email you an access key.
2. Set `formsKey: "your-access-key"`.

Without a key, the contact form and chat hand-off open the visitor's email app instead.

## 3. Supabase (signups and messages saved online)
1. Create a project at supabase.com.
2. **SQL Editor → New query**: paste [`apps/api/supabase/schema.sql`](apps/api/supabase/schema.sql) and run it.
   The tables are insert-only for the public site: visitors can submit but never read anyone's data.
3. **Project Settings → API**: copy the **Project URL** and the **anon public** key into
   `supabaseUrl` and `supabaseAnonKey`. The anon key is safe in the browser. **Never** use the
   `service_role` key in the website.
4. New signups appear in **Table Editor → signups**, and contact/chat messages in **messages**.

Logins and dashboards still run per browser (demo); moving those to Supabase Auth is a separate job.

## 4. Stripe (payments)
1. In Stripe, create a Product + recurring Price for **Starter**, **Pro** and **Elite**
   (monthly $100 / $150 / $200, matching `plans` in `config.js`).
2. For each, create a **Payment Link**. Set its after-payment redirect to `…/dashboard.html`.
3. Paste the publishable key into `stripePublishableKey` and the three links into `stripeLinks`.
4. For the LAUNCH50 / OPTFAST / STEM20 codes to discount real charges, create matching
   **Promotion codes** in Stripe and enable "Allow promotion codes" on the Payment Links.
   (The site's own code check is a preview only; Stripe is what actually charges.)

Use test mode first (`pk_test_…` and test links) and pay with card `4242 4242 4242 4242`.

## 5. Real AI resumes (RezForge)
Create `.env` in the repo root (it's git-ignored):

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then run `npm run api:env`. On Vercel, add `ANTHROPIC_API_KEY` under Project → Settings →
Environment Variables instead; `vercel.json` already routes `/api/rezforge`.

## 6. Permanent link
- **GitHub Pages:** repo **Settings → Pages → Source: GitHub Actions**. After that, every push to
  `main` publishes `apps/web` via `.github/workflows/pages.yml`.
- **Netlify:** "Add new site → Import from Git", or drag the `apps/web` folder onto
  app.netlify.com/drop. `netlify.toml` already sets the publish folder.
- **Vercel:** import the repo; `vercel.json` sets the output folder, and the API function works there.

Before merging to `main`, check any host already connected to this repo. The restructure moved the site
into `apps/web`, so a host still publishing the old root folder would break.
