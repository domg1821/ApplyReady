# ApplyReady — Setup Guide

## Quick Start

```bash
cd C:\Users\21Dom\Documents\applyready
npm install
cp .env.local.example .env.local
# Fill in your env vars (see below)
npm run dev
```

Open http://localhost:3000

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

### 1. Supabase
1. Go to https://supabase.com → New project
2. Go to Settings → API
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
6. Run the schema: go to SQL Editor → paste contents of `supabase/schema.sql` → Run

### 2. Stripe
1. Go to https://stripe.com → Dashboard
2. Get your keys from Developers → API keys
3. Create two products: Monthly ($19/mo) and Annual ($144/yr = $12/mo)
4. Copy the price IDs to `STRIPE_MONTHLY_PRICE_ID` and `STRIPE_ANNUAL_PRICE_ID`
5. For webhooks (local dev): `stripe listen --forward-to localhost:3000/api/stripe/webhook`
6. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### 3. Anthropic Claude API
1. Go to https://console.anthropic.com
2. Create an API key → `ANTHROPIC_API_KEY`

---

## Architecture

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── (auth)/
│   │   ├── login/            # Login page
│   │   └── signup/           # Signup page
│   ├── dashboard/            # User dashboard
│   ├── resume/
│   │   ├── new/              # Create resume
│   │   └── [id]/
│   │       ├── page.tsx      # Resume detail + analysis
│   │       └── edit/         # Resume builder form
│   ├── settings/             # Account & billing
│   └── api/
│       ├── analyze/          # AI resume analysis
│       ├── generate/         # AI resume rewrite
│       ├── extract/          # Extract structured data from text
│       ├── upload/           # PDF text extraction
│       └── stripe/           # Checkout, portal, webhook
├── components/
│   ├── ui/                   # Button, Badge, Modal, ScoreRing
│   ├── landing/              # Navbar, Hero, Features, HowItWorks, Pricing, Footer
│   ├── dashboard/            # Sidebar, UploadZone
│   ├── resume/
│   │   ├── ResumePreview     # Template renderer
│   │   ├── TemplateSelector  # 5 template picker
│   │   └── templates/        # Modern, Executive, Minimal, Student, Tech
│   └── analysis/             # ScoreCard, FeedbackList, UpgradeModal
├── lib/
│   ├── claude.ts             # Anthropic API calls
│   ├── stripe.ts             # Stripe client
│   ├── pdf.ts                # PDF text extraction
│   ├── utils.ts              # Helpers
│   └── supabase/             # Client + server Supabase
├── hooks/
│   ├── useUser.ts            # Auth + profile state
│   └── useSubscription.ts    # Stripe checkout
└── types/index.ts            # All TypeScript types
```

## Business Model

| Feature | Free | Pro |
|---------|------|-----|
| Resume analysis | 1x | Unlimited |
| Resume score + ATS score | ✓ | ✓ |
| Detailed feedback | ✓ | ✓ |
| Full AI rewrite | ✗ | ✓ |
| PDF export | ✗ | ✓ |
| 5 premium templates | ✗ | ✓ |
| Editable sections | ✗ | ✓ |

## Deployment (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add all env vars in Vercel dashboard
4. Set `NEXT_PUBLIC_APP_URL` to your production URL
5. Update Stripe webhook endpoint to `https://yourdomain.com/api/stripe/webhook`
