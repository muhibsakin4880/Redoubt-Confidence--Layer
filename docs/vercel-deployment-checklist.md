# Vercel Deployment Checklist

Use this checklist before and after every deploy.

## 1) Git Sync

- `git status -sb` should be clean.
- `git log --oneline --decorate -n 3` should show your latest commit on `main`.
- `git push origin main` should succeed with no pending local commits.

## 2) Vercel Project Settings

- Connected Git repository: `muhibsakin4880/Redoubt-Confidence--Layer`
- Production branch: `main`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 3) SPA Routing Safety

- Ensure this file exists: `frontend/vercel.json`
- Required rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This prevents `404 NOT_FOUND` on direct routes like `/dashboard` or `/admin/login`.

## 4) Environment Variables

- Confirm all required `VITE_*` env vars are set in Vercel Project Settings.
- If env vars changed, trigger a redeploy after saving.

## 5) Post-Deploy Validation

- Open production URL:
  - `https://redoubt-confidence-layer.vercel.app/`
- Test direct routes (paste in browser URL bar):
  - `/dashboard`
  - `/admin/login`
  - `/admin/dashboard`
  - `/admin/onboarding-queue`
- If UI looks stale, hard refresh (`Ctrl+F5`) to clear cached assets.

## 6) If Something Looks Outdated

- In Vercel Dashboard:
  - Check latest deployment commit SHA matches GitHub `main`.
  - Redeploy the latest production deployment.
- Re-check routes and hard refresh.
