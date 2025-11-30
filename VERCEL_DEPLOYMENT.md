# Vercel Backend Deployment Guide

## Important Changes Made

1. **Created `api/index.js`** - This exports the Express app as a Vercel serverless function
2. **Created `vercel.json`** - This configures Vercel to route all requests to the serverless function
3. **Enhanced CORS** - Improved CORS handling to work better with Vercel's serverless environment

## How It Works

- **Local Development**: Use `npm run dev` or `npm start` - this uses `server.js` with `app.listen()`
- **Vercel Production**: Vercel automatically uses `api/index.js` which exports the Express app as a serverless function

## Environment Variables Required in Vercel

Make sure to set these in Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-strong-secret-key-here
ALLOWED_ORIGINS=https://futena-frontend.vercel.app
```

## Deployment Steps

1. **Push code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel serverless function support"
   git push origin main
   ```

2. **Vercel will auto-deploy** if connected to GitHub, or manually deploy from Vercel Dashboard

3. **Verify deployment**:
   - Check: `https://futena-backend.vercel.app/` should return `{"message":"Frutena Backend API is running!"}`
   - Test API: `https://futena-backend.vercel.app/api/admin/register`

## Troubleshooting

### Issue: CORS errors still occurring
- Check that `ALLOWED_ORIGINS` includes your frontend URL
- Verify `NODE_ENV=production` is set in Vercel

### Issue: Database connection errors
- Ensure `MONGODB_URI` is correctly set in Vercel
- Check MongoDB Atlas network access allows Vercel IPs (or use 0.0.0.0/0 for all)

### Issue: Routes not working
- Verify `vercel.json` is in the root of the backend directory
- Check that `api/index.js` exists and exports the Express app

## Notes

- The `server.js` file is still used for local development
- The `api/index.js` file is used by Vercel for serverless deployment
- Both files share the same Express app configuration and routes

