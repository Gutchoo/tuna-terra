# Service Costs & Provider Tracking

This document tracks all services used by the CRE real estate portfolio management application for cost monitoring and provider comparison purposes.

## 🎯 Executive Summary
- **Current Monthly Estimate**: $25-150/month (varies by usage)
- **Critical Cost Centers**: Regrid API, Mapbox (usage-based)
- **Free Tier Services**: Supabase, Vercel (currently free)

---

## 📊 Service Breakdown

### **🗺️ Mapping & Geolocation**

#### **Mapbox** 
- **Service**: Interactive maps, satellite imagery, property polygon visualization
- **Pricing Model**: Usage-based (pay per map load)
- **Cost**: $0.50-$2.00 per 1,000 map views
- **Usage**: Full-screen map view (`/dashboard/map`) with property overlays
- **Free Tier**: 50,000 map views/month
- **Environment Variable**: `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`

#### **Google Places API**
- **Service**: Address autocomplete and validation
- **Pricing Model**: Per API request
- **Cost**: $2.83-$5.66 per 1,000 requests (depending on API type)
- **Usage**: Property upload forms, address search functionality
- **Free Tier**: $200/month credit (covers ~35K-70K requests)
- **Environment Variables**: None (embedded in frontend)

---

### **🏠 Property Data**

#### **Regrid API** ⚠️ *Primary Cost Driver*
- **Service**: Property data enrichment, APN lookups, owner information
- **Pricing Model**: Per property lookup
- **Cost**: $0.05-$0.15 per property lookup (varies by data depth)
- **Usage**: Property creation, data refresh, APN/address searches
- **Limit Implemented**: 25 lookups/month per user (Free tier)
- **Environment Variable**: `REGRID_API_TOKEN`
- **Endpoints Used**:
  - `/api/properties/lookup` - Address/APN property lookup
  - `/api/properties/search` - Property search functionality
  - `/api/user-properties` - Property creation with data enrichment

---

### **💾 Database & Backend**

#### **Supabase**
- **Service**: PostgreSQL database, authentication, real-time subscriptions
- **Pricing Model**: Usage-based with generous free tier
- **Cost**: Free up to 500MB DB / 2GB bandwidth, then $25/month Pro plan
- **Current Usage**: Database, Auth, RLS policies, stored functions
- **Free Tier**: 500MB database, 2GB bandwidth, 50MB file storage
- **Environment Variables**: 
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

---

### **🚀 Hosting & Deployment**

#### **Vercel**
- **Service**: Frontend hosting, serverless functions, CDN
- **Pricing Model**: Usage-based with generous free tier
- **Cost**: Free for hobby projects, $20/month Pro (100GB bandwidth)
- **Current Usage**: Next.js app hosting, API routes, static assets
- **Free Tier**: 100GB bandwidth, unlimited projects
- **Environment Variables**: Managed through Vercel dashboard

---

### **📧 Email & Notifications**

#### **Resend** (Potential Future Service)
- **Service**: Transactional emails for portfolio sharing invitations
- **Status**: Not yet implemented
- **Pricing Model**: Per email sent
- **Cost**: $20/month for 100K emails
- **Use Case**: Portfolio invitation emails, password resets

---

## 💰 Cost Analysis by Usage Scenarios

### **Light Usage** (10-50 users, <1000 properties)
- **Regrid**: ~$50/month (1000 lookups)
- **Mapbox**: ~$10/month (20K map views)  
- **Google Places**: Free (within credit)
- **Supabase**: Free
- **Vercel**: Free
- **Total**: ~$60/month

### **Medium Usage** (50-200 users, 1000-5000 properties)
- **Regrid**: ~$200/month (4000 lookups)
- **Mapbox**: ~$40/month (80K map views)
- **Google Places**: ~$20/month (exceeds free credit)
- **Supabase**: $25/month (Pro plan)
- **Vercel**: $20/month (Pro plan)
- **Total**: ~$305/month

### **High Usage** (200+ users, 5000+ properties)
- **Regrid**: ~$500+/month (10K+ lookups)
- **Mapbox**: ~$100+/month (200K+ views)
- **Google Places**: ~$50/month
- **Supabase**: $25-100/month (depending on DB size)
- **Vercel**: $20-65/month (Pro/Team plan)
- **Total**: ~$695+/month

---

## 🔄 Alternative Providers

### **Property Data Alternatives to Regrid**
1. **PropertyRadar API** - Similar pricing, different data coverage
2. **RentSpree API** - Real estate focused, potentially cheaper
3. **Custom web scraping** - Higher development cost, legal risks
4. **BigQuery Public Datasets** - One-time cost, limited freshness

### **Mapping Alternatives to Mapbox**
1. **Google Maps Platform** - Similar pricing, better integration with Places API
2. **OpenStreetMap + Leaflet** - Free maps, limited satellite imagery
3. **ArcGIS** - Enterprise focused, potentially expensive

### **Database Alternatives to Supabase**
1. **PlanetScale** - MySQL, similar pricing
2. **Railway** - PostgreSQL, potentially cheaper
3. **AWS RDS** - More complex, potentially cheaper at scale
4. **Self-hosted PostgreSQL** - Requires DevOps overhead

---

## 🎛️ Cost Control Measures Implemented

### **Usage Limits**
- ✅ **Property Lookup Limits**: 25/month per user (Free tier)
- ✅ **Rate Limiting**: Prevents API abuse (10 requests/minute strict endpoints)
- ✅ **Atomic Limit Checking**: Prevents race conditions and overage

### **Optimization Strategies**
- ✅ **Client-side caching**: Reduces redundant map loads
- ✅ **Property data caching**: Stored in database to avoid re-lookups
- ✅ **Efficient queries**: RLS policies prevent unnecessary data transfer
- ✅ **Progressive loading**: Maps and property data loaded on-demand

---

## 📈 Monitoring & Alerts

### **Current Monitoring**
- Usage tracking in `user_limits` table
- API call logging for property lookups
- Dashboard usage indicators

### **Recommended Alerts** (Future Implementation)
- Email alerts at 80% of monthly limits
- Cost threshold alerts via provider dashboards
- Usage spike notifications
- Failed API call rate monitoring

---

## 🔮 Scaling Considerations

### **Revenue Thresholds**
- **Break-even**: ~$500 MRR to cover medium usage costs
- **Profitable**: ~$1000+ MRR for sustainable growth
- **Enterprise**: Custom pricing for high-volume users

### **Cost Optimization Timeline**
1. **Phase 1** (0-100 users): Leverage free tiers, basic limits
2. **Phase 2** (100-500 users): Optimize APIs, negotiate volume discounts
3. **Phase 3** (500+ users): Consider enterprise plans, alternative providers

---

## 📅 Last Updated
**Date**: August 14, 2025  
**Next Review**: Monthly (2nd week of each month)

---

## 🔗 Provider Links
- [Regrid API Documentation](https://regrid.com/api)
- [Mapbox Pricing](https://www.mapbox.com/pricing)
- [Google Places API Pricing](https://developers.google.com/maps/billing/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [Vercel Pricing](https://vercel.com/pricing)