# Deployment Checklist

## ✅ Pre-Deployment Checks

### 1. Environment Variables (Required in Production)
Make sure these are set in your deployment platform (Vercel/Render/etc.):

```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-strong-secret-key-here
ALLOWED_ORIGINS=https://frutena.com,https://www.frutena.com,https://futena-frontend.vercel.app
```

### 2. Optional Environment Variables
```
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key (optional - for better translation)
```

### 3. Code Cleanup ✅
- ✅ Removed excessive console.log statements
- ✅ Translation logs only show in development mode
- ✅ Error logs still show in production (important for debugging)

### 4. Security Checks ✅
- ✅ .env files are in .gitignore
- ✅ No hardcoded secrets in code
- ✅ CORS properly configured for production domains

### 5. Database
- ✅ MongoDB Atlas connection string configured
- ✅ Network access allows deployment platform IPs (or 0.0.0.0/0 for all)

### 6. File Uploads
⚠️ **Important**: The `uploads/` directory is ephemeral on serverless platforms (Vercel).
- Consider using cloud storage (AWS S3, Cloudinary, etc.) for production
- Or use Render with persistent disk for file storage

### 7. API Endpoints
- ✅ All routes properly configured
- ✅ CORS middleware handles preflight requests
- ✅ Error handling middleware in place

## 🚀 Deployment Steps

### For Vercel:
1. Push code to GitHub
2. Vercel will auto-deploy if connected
3. Set environment variables in Vercel Dashboard
4. Verify deployment at: `https://futena-backend.vercel.app/`

### For Render:
1. Push code to GitHub
2. Create new Web Service
3. Set environment variables
4. Deploy

## 📝 Post-Deployment Verification

1. ✅ Health check: `GET /` should return API message
2. ✅ Test admin login: `POST /api/admin/login`
3. ✅ Test CORS: Frontend should connect without CORS errors
4. ✅ Test translation: Add news with auto-translate enabled
5. ✅ Test file uploads: Upload image in admin panel

## 🔍 Troubleshooting

### CORS Errors
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Verify `NODE_ENV=production` is set

### Database Connection Errors
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access settings

### Translation Not Working
- Check if `GOOGLE_TRANSLATE_API_KEY` is set (optional)
- MyMemory API (free) should work without API key
- Check logs for translation errors

### File Upload Issues
- Verify uploads directory exists
- Check file size limits (5MB default)
- Consider cloud storage for production

