# ⚡ ZENEX AI - 5 MINUTE QUICKSTART

## 🎯 Goal: Get ZENEX AI running locally in 5 minutes

---

## Step 1: Extract & Setup (1 min)

```bash
# Extract the zip
unzip zenex-ai-production-ready.zip
cd zenex-ai-production

# Run setup script
bash setup.sh
```

This will:
- Install dependencies
- Create `.env.local` from `.env.example`

---

## Step 2: Get API Keys (2 min)

### Required (Free Tier Available):

1. **Groq** (Fast AI) - [groq.com](https://groq.com)
   - Sign up
   - Get API key
   - Add to `.env.local`: `GROQ_KEYS=gsk_your_key`

2. **GitHub Token** - [github.com/settings/tokens](https://github.com/settings/tokens)
   - Generate token with `repo` permission
   - Add to `.env.local`: `GITHUB_TOKEN=ghp_your_token`

3. **Turso** (Database) - [turso.tech](https://turso.tech)
   ```bash
   turso auth login
   turso db create zenex-dev
   turso db show zenex-dev  # Copy URL and token
   ```
   Add to `.env.local`:
   ```
   TURSO_DATABASE_URL=libsql://...
   TURSO_AUTH_TOKEN=eyJ...
   ```

4. **Firebase** - [console.firebase.google.com](https://console.firebase.google.com)
   - Create project
   - Enable Auth → Email/Password
   - Get config from Project Settings
   - Add all `FIREBASE_*` values to `.env.local`

---

## Step 3: Run Development Server (30 sec)

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

---

## Step 4: Test AI Generation (1 min)

```bash
# In another terminal:
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "projectId": "proj-001",
    "prompt": "Create a beautiful landing page for a coffee shop",
    "siteType": "business"
  }'
```

If successful, you'll get:
- Generated HTML
- GitHub URL
- Preview URL

---

## ✅ You're Done!

**ZENEX AI is now running locally!** 🎉

---

## 🚀 Next Steps

1. **Deploy to Vercel** (5 minutes)
   ```bash
   vercel login
   vercel --prod
   ```
   See `DEPLOYMENT.md` for full guide

2. **Build Dashboard UI**
   - Add pages in `app/dashboard/`
   - Use generated HTML

3. **Customize**
   - Modify AI prompts in `src/ai/ai-manager.ts`
   - Add payment gateways (optional)
   - Style with Tailwind CSS

---

## 🐛 Troubleshooting

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Database connection failed"
- Check Turso URL/token
- Run: `turso db shell your-db-name` to test

### "AI generation failed"
- Check API key in `.env.local`
- Test: `curl https://api.groq.com/openai/v1/models -H "Authorization: Bearer YOUR_KEY"`

### "GitHub 404"
- Verify token has `repo` permission
- Check repo name: should be `Zenex-users-data-1`

---

## 📚 Documentation

- `README.md` - Complete overview
- `DEPLOYMENT.md` - Production deployment
- `FIXES.md` - What was fixed from original

---

## 💡 Tips

- Start with free tiers (Groq, Turso free plans)
- Test locally before deploying
- Read `DEPLOYMENT.md` before production deploy
- Use `.env.example` as reference

---

**Ready to build amazing websites with AI?** 🚀

Run `npm run dev` and start creating!
