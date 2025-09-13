# eBantu+ Environment Variables Setup Guide
## For Vercel Deployment

### 🎯 Required Environment Variables

## 1. DATABASE CONFIGURATION

### Option A: Vercel Postgres (Recommended for this project)
```bash
# After creating Vercel project, go to Storage tab and create Postgres database
DATABASE_URL="postgres://default:password@ep-example-123.us-east-1.postgres.vercel-storage.com/verceldb"
DIRECT_URL="postgres://default:password@ep-example-123.us-east-1.postgres.vercel-storage.com/verceldb"
```

**How to get these:**
1. Deploy to Vercel first: `vercel --prod`
2. Go to your Vercel dashboard
3. Click on your project → Storage tab
4. Click "Create Database" → Choose "Postgres"
5. Copy the connection strings provided

### Option B: Supabase (Free Alternative)
```bash
DATABASE_URL="postgresql://postgres:password@db.projectid.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:password@db.projectid.supabase.co:5432/postgres"
```

**How to get these:**
1. Go to https://supabase.com
2. Create account and new project
3. Go to Settings → Database
4. Copy the connection string

### Option C: Railway (Another Alternative)
```bash
DATABASE_URL="postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway"
DIRECT_URL="postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway"
```

**How to get these:**
1. Go to https://railway.app
2. Create project with PostgreSQL template
3. Copy connection string from Variables tab

---

## 2. OPENAI API CONFIGURATION

```bash
OPENAI_API_KEY="sk-proj-abcd1234567890..."
```

**How to get this:**
1. Go to https://platform.openai.com
2. Create account or sign in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-proj-` or `sk-`)

**Pricing for hackathon:**
- GPT-4 Turbo: ~$0.01 per 1K tokens
- For PDF processing demo: ~$1-5 total cost
- Free trial includes $5 credit

---

## 3. NEXTAUTH CONFIGURATION

```bash
NEXTAUTH_SECRET="your-super-secret-key-here-min-32-chars"
NEXTAUTH_URL="https://your-vercel-app-name.vercel.app"
```

**How to generate NextAuth secret:**
```bash
# Option 1: Using OpenSSL (Mac/Linux)
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

**NextAuth URL:**
- Will be your Vercel deployment URL
- Format: `https://your-app-name.vercel.app`
- You'll get this after first Vercel deployment

---

## 4. VERCEL BLOB STORAGE

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_abc123..."
```

**How to get this:**
1. After deploying to Vercel
2. Go to your project dashboard
3. Storage tab → Create → Blob
4. Copy the read-write token provided

**Alternative: For hackathon demo, you can skip this initially**
- File uploads can work without blob storage
- Use local file processing for demo

---

## 🚀 RECOMMENDED SETUP ORDER FOR HACKATHON

### Phase 1: Minimum Viable Deployment
```bash
# Only these are required for basic deployment:
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="sk-..."
```

### Phase 2: Full Features
```bash
# Add these for complete functionality:
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-app.vercel.app"
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

---

## 💡 COST-FREE ALTERNATIVES FOR HACKATHON

### Database (Free Tiers)
- **Supabase**: 500MB free, 2 projects
- **Railway**: $5 free credit monthly
- **Vercel Postgres**: 60 hours free per month

### OpenAI (Minimal Cost)
- **Free Trial**: $5 credit for new accounts
- **Expected Usage**: $1-3 for hackathon demo
- **Alternative**: Use Claude or local LLM

### File Storage
- **Local Development**: No external storage needed
- **Vercel Blob**: Free tier available
- **Alternative**: Store files in database as base64

---

## 🔧 QUICK START COMMANDS

```bash
# 1. Create .env.local file
touch .env.local

# 2. Add your variables (get from services above)
echo 'DATABASE_URL="your_postgres_url"' >> .env.local
echo 'OPENAI_API_KEY="your_openai_key"' >> .env.local

# 3. Test locally
npm run dev

# 4. Deploy to Vercel
vercel --prod

# 5. Add environment variables in Vercel dashboard
```

---

## 📋 ENVIRONMENT VARIABLES CHECKLIST

- [ ] **DATABASE_URL** - Primary database connection
- [ ] **DIRECT_URL** - Direct database connection (same as above usually)
- [ ] **OPENAI_API_KEY** - For PDF text extraction
- [ ] **NEXTAUTH_SECRET** - Authentication security key
- [ ] **NEXTAUTH_URL** - Your app's URL
- [ ] **BLOB_READ_WRITE_TOKEN** - File storage (optional for demo)

---

## 🆘 TROUBLESHOOTING

### Database Connection Issues
```bash
# Test connection locally
npx prisma db push
npx prisma studio
```

### OpenAI API Issues
```bash
# Test API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Vercel Deployment Issues
```bash
# Check logs
vercel logs
```

---

**Next Steps:**
1. Choose your preferred database provider
2. Create OpenAI account
3. Generate NextAuth secret
4. Deploy to Vercel
5. Configure environment variables in Vercel dashboard