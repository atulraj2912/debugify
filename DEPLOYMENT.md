# 🚀 Deploying Debugify to Vercel

## Prerequisites
- GitHub account with your code pushed to a repository
- Vercel account (sign up at https://vercel.com)
- Clerk account (sign up at https://clerk.com)
- Google Gemini API key (get from https://aistudio.google.com/app/apikey)

## Step-by-Step Deployment Guide

### 1. Get Your API Keys

#### Clerk Keys:
1. Go to https://dashboard.clerk.com/
2. Select your application or create a new one
3. Go to **API Keys** section
4. Copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts with `pk_`)
   - `CLERK_SECRET_KEY` (starts with `sk_`)

#### Gemini API Key:
1. Go to https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Copy the `GEMINI_API_KEY`

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit https://vercel.com
   - Sign in with your GitHub account

2. **Import Your Repository**
   - Click **"Add New..."** → **"Project"**
   - Select your GitHub repository: `atulraj2912/debugify`
   - Click **"Import"**

3. **Configure Environment Variables**
   - In the deployment configuration, find **"Environment Variables"**
   - Add the following variables:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_xxxxx...
     CLERK_SECRET_KEY = sk_test_xxxxx...
     GEMINI_API_KEY = xxxxx...
     ```
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

4. **Deploy**
   - Click **"Deploy"**
   - Wait for the build to complete (2-3 minutes)
   - Your app will be live at `https://debugify-xxxxx.vercel.app`

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   vercel env add CLERK_SECRET_KEY
   vercel env add GEMINI_API_KEY
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### 3. Configure Clerk for Production

After deploying, you need to add your production URL to Clerk:

1. Go to https://dashboard.clerk.com/
2. Select your application
3. Go to **Settings** → **Domains**
4. Add your Vercel domain: `https://debugify-xxxxx.vercel.app`
5. Save changes

### 4. Verify Deployment

1. Visit your deployed URL
2. Click **Sign In** to test authentication
3. Try creating a file and running code
4. Test the AI chat feature

## Troubleshooting

### Build Fails with Clerk Error
**Error:** `Missing publishableKey`

**Solution:** Make sure you've added all three environment variables in Vercel:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all three keys mentioned above
3. Redeploy: Deployments → Latest → "Redeploy"

### Authentication Redirects Not Working
**Solution:** Add your Vercel domain to Clerk allowed domains:
1. Clerk Dashboard → Settings → Domains
2. Add: `https://your-app.vercel.app`

### API Routes Failing
**Solution:** 
- Check that `GEMINI_API_KEY` is set correctly
- Verify the key is valid at https://aistudio.google.com/app/apikey

### Changes Not Reflecting
**Solution:**
- Make sure you pushed your changes to GitHub
- Vercel automatically redeploys on git push
- Or manually redeploy from Vercel Dashboard

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Add the custom domain to Clerk Dashboard as well

## Continuous Deployment

Vercel automatically deploys:
- **Production:** Every push to `main` branch
- **Preview:** Every push to other branches or pull requests

## Cost

- **Vercel:** Free tier includes unlimited deployments
- **Clerk:** Free tier includes 10,000 MAUs (Monthly Active Users)
- **Gemini API:** Free tier includes 60 requests per minute

## Support

- Vercel Docs: https://vercel.com/docs
- Clerk Docs: https://clerk.com/docs
- Next.js Docs: https://nextjs.org/docs
- Issue with app: https://github.com/atulraj2912/debugify/issues

---

**🎉 Your Debugify app is now live!** Share it with others and start debugging! 🚀
