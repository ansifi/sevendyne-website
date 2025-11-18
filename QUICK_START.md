# 7dyne Website - Quick Start Guide

## Running the Website Locally

### Option 1: Using the Startup Script
```bash
cd /home/ansif/works/sevendyne/ads/7dyne
chmod +x start_server.sh
./start_server.sh
```

### Option 2: Using Python Directly
```bash
cd /home/ansif/works/sevendyne/ads/7dyne
python3 -m http.server 7007
```

### Option 3: Using Python in Background
```bash
cd /home/ansif/works/sevendyne/ads/7dyne
python3 -m http.server 7007 > /tmp/7dyne_server.log 2>&1 &
```

## Access the Website

Once the server is running, open your browser and go to:
**http://localhost:7007**

## Stop the Server

If running in foreground (Option 1 or 2):
- Press `Ctrl+C`

If running in background (Option 3):
```bash
lsof -ti:7007 | xargs kill -9
```

## Testing Checklist

### ✅ Basic Functionality
- [ ] Homepage loads correctly
- [ ] Navigation menu works
- [ ] All links are functional
- [ ] Images load properly
- [ ] Responsive design works on mobile

### ✅ Contact Forms
- [ ] Main contact form (index.html) submits successfully
- [ ] Contact page form (contact.html) submits successfully
- [ ] Form validation works (required fields)
- [ ] Success message displays after submission
- [ ] Error handling works if submission fails

### ✅ Content
- [ ] All service descriptions are accurate
- [ ] Pricing information is correct
- [ ] Contact information (email, phone) is correct
- [ ] All pages load without errors

### ✅ Forms Configuration
- [ ] Formspree form ID: `mldoabko`
- [ ] Email notifications go to: `technical@7dyne.com`
- [ ] Form submissions are received

## Current Status

**Website:** 7dyne Technical Support  
**Port:** 7007  
**Email:** technical@7dyne.com  
**Formspree ID:** mldoabko

**Current Client:**
- Optimus: ₹40,000/month

**Target:**
- 10 clients at ₹3L/month average
- Total MRR: ₹30L/month (₹3,000,000/month)

## Next Steps After Testing

1. **Deploy to Production:**
   - Set up domain (7dyne.com or subdomain)
   - Deploy to hosting (Netlify/Vercel/Cloudflare Pages)
   - Configure SSL certificate
   - Set up DNS

2. **Marketing Setup:**
   - Google Analytics
   - SEO optimization
   - Social media profiles
   - Content marketing plan

3. **Client Acquisition:**
   - See `CLIENT_ACQUISITION_PLAN.md` for detailed strategy
   - Start LinkedIn outreach
   - Email campaigns
   - Optimus referral program

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 7007
lsof -ti:7007 | xargs kill -9
```

### Form Not Submitting
- Check browser console for errors
- Verify Formspree form ID is correct
- Check network tab for API calls
- Verify email field name is `_replyto`

### Images Not Loading
- Check file paths are correct
- Verify images exist in `images/` folder
- Check browser console for 404 errors

