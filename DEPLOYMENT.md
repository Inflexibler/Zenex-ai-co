# 🚀 ZENEX AI - DEPLOYMENT CHECKLIST

## ✅ PRE-DEPLOYMENT CHECKLIST

**Complete ALL items before deploying to production:**

### 1. GitHub Setup
- [ ] Create repo: `Zenex-users-data-1` (public)
- [ ] Add README.md to repo
- [ ] Create `users/` directory
- [ ] Generate GitHub Personal Access Token with `repo` permissions
- [ ] Verify token works: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`

### 2. Database Setup (Turso)
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Create database
turso db create zenex-production

# Get credentials
turso db show zenex-production
# Copy: URL and Auth Token
```

- [ ] Turso CLI installed
- [ ] Database created
- [ ] Have `TURSO_DATABASE_URL`
- [ ] Have `TURSO_AUTH_TOKEN`

### 3. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project: `zenex-ai-prod`
3. Enable Authentication → Email/Password
4. Generate service account:
   - Settings → Service Accounts → Generate New Private Key
5. Get client config:
   - Project Settings → General → Your Apps → Web App

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Have service account JSON
- [ ] Have client config (API key, etc.)

### 4. AI Provider API Keys

#### Groq (Required)
- [ ] Sign up at [groq.com](https://groq.com)
- [ ] Get API key(s)
- [ ] Add to `GROQ_KEYS` (comma-separated)

#### Anthropic (Required for Architect)
- [ ] Sign up at [anthropic.com](https://console.anthropic.com)
- [ ] Get API key(s)
- [ ] Add to `ANTHROPIC_KEYS`

#### Optional (for redundancy):
- [ ] Gemini keys (`GEMINI_KEYS`)
- [ ] SambaNova keys (`SAMBANOVA_KEYS`)

### 5. Payment Gateways (Optional)
Skip if not implementing payments yet:
- [ ] Razorpay (India)
- [ ] Polar (Global)
- [ ] Flutterwave (Africa)
- [ ] bKash (Bangladesh)

---

## 🔧 VERCEL DEPLOYMENT

### Step 1: Install Vercel CLI
```bash
npm i -g vercel
vercel login
```

### Step 2: Link Project
```bash
cd zenex-ai-production
vercel link
```

### Step 3: Add Environment Variables

**Method A: Via Dashboard**
1. Go to Vercel Dashboard
2. Select project → Settings → Environment Variables
3. Add ALL variables from `.env.example`

**Method B: Via CLI**
```bash
vercel env add TURSO_DATABASE_URL
# Enter value when prompted
# Select: Production, Preview, Development

vercel env add TURSO_AUTH_TOKEN
vercel env add GITHUB_TOKEN
vercel env add GITHUB_OWNER
vercel env add GITHUB_REPO
vercel env add GROQ_KEYS
vercel env add ANTHROPIC_KEYS
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_PRIVATE_KEY
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_APP_URL
```

### Step 4: Deploy
```bash
vercel --prod
```

### Step 5: Initialize Database
After deployment, run:
```bash
curl -X POST https://your-app.vercel.app/api/init-db
```

This creates all tables.

---

## 🧪 POST-DEPLOYMENT TESTING

### Test 1: Homepage
```bash
curl https://your-app.vercel.app
# Should return HTML
```

### Test 2: Ghost Serving (Edge)
```bash
# This will 404 until you create a project, but should not error
curl https://your-app.vercel.app/preview/test123/proj456
# Expected: 404 or "Site not found"
```

### Test 3: API Health
```bash
curl https://your-app.vercel.app/api/health
# Should return: {"status": "ok"}
```

### Test 4: AI Generation (after auth)
```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "projectId": "test-proj",
    "prompt": "Create a landing page for a coffee shop",
    "siteType": "business"
  }'
```

---

## 🔒 SECURITY CHECKLIST

- [ ] No `.env.local` or `.env` in git
- [ ] `.gitignore` includes all env files
- [ ] All secrets are in Vercel ENV (not in code)
- [ ] `GITHUB_TOKEN` has minimal permissions (only `repo`)
- [ ] Firebase rules are configured (if using Firestore)
- [ ] HTTPS only (automatic with Vercel)
- [ ] Prompt firewall is active (`checkPromptSafety`)
- [ ] Rate limiting is enabled (`checkRateLimit`)

---

## 🐛 TROUBLESHOOTING

### Build Fails
```bash
# Check build logs
vercel logs

# Common issues:
# 1. Missing ENV vars → Add them in Vercel dashboard
# 2. TypeScript errors → Run `npm run type-check` locally
# 3. Module not found → Run `npm install` locally
```

### Middleware Errors
```bash
# Check Edge function logs
vercel logs --follow

# Common issues:
# 1. Using Node.js API in Edge → Must be Edge-compatible
# 2. Timeout → Check CDN response time
# 3. 404 from GitHub → Verify repo name and token
```

### Database Connection Fails
```bash
# Test Turso connection
turso db shell zenex-production

# If fails:
# 1. Check TURSO_DATABASE_URL format
# 2. Verify TURSO_AUTH_TOKEN is valid
# 3. Check Turso dashboard for status
```

### AI API Errors
```bash
# Check logs for specific provider
# "Groq error" → Check GROQ_KEYS
# "Anthropic error" → Check ANTHROPIC_KEYS

# Test API key manually:
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_KEY"
```

---

## 📊 MONITORING

### Add Monitoring (Recommended)

1. **Vercel Analytics** (built-in)
   - Enable in dashboard

2. **Sentry** (error tracking)
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Vercel KV** (analytics upgrade)
   ```bash
   vercel kv create
   # Add KV_* env vars
   ```

---

## ✅ DEPLOYMENT COMPLETE!

Your ZENEX AI is now live and production-ready! 🎉

**Next Steps:**
1. Create your first project via dashboard
2. Test AI generation
3. Monitor performance in Vercel dashboard
4. Add custom domain (Settings → Domains)
5. Invite beta users

---

## 📞 SUPPORT

Deployment issues? Check:
1. Vercel build logs
2. Browser console (for client errors)
3. Network tab (for API errors)
4. This checklist (did you miss a step?)

**Common Fixes:**
- Missing ENV var → Add in Vercel dashboard
- Database error → Re-run init-db endpoint
- GitHub 404 → Check token permissions
- AI timeout → Check API keys and quotas
