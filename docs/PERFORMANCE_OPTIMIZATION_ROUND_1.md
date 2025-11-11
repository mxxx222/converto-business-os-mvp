# ⚡ Performance Optimization Round 1

**Thursday 21.11 - Performance Audit & Optimization Plan**

---

## 🎯 **Performance Objectives**

### **Current Performance Baseline**
- **PageSpeed Score:** To be measured
- **Load Time:** To be measured  
- **Core Web Vitals:** To be measured
- **API Response:** To be measured

### **Target Performance Goals**
- **PageSpeed Score:** > 90 (Mobile & Desktop)
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **API Response Time:** < 500ms
- **Database Query Time:** < 100ms

---

## 📊 **Performance Audit Plan**

### **Step 1: PageSpeed Insights Audit (30 minutes)**
```bash
# Run PageSpeed Insights for converto.fi
# URL: https://pagespeed.web.dev/

# Test scenarios:
# 1. Desktop homepage
# 2. Mobile homepage  
# 3. Desktop dashboard
# 4. Mobile dashboard
# 5. Landing page variants

# Collect metrics:
# - Performance score
# - First Contentful Paint
# - Largest Contentful Paint
# - Cumulative Layout Shift
# - First Input Delay
# - Total Blocking Time
```

### **Step 2: Core Web Vitals Measurement (30 minutes)**
```javascript
// Add to website for real user monitoring
import {getCLS, getFID, getFCP, getLCP, getTTFB} from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);

// Custom performance logging
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('Performance metrics:', {
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    connect: perfData.connectEnd - perfData.connectStart,
    request: perfData.responseStart - perfData.requestStart,
    response: perfData.responseEnd - perfData.responseStart,
    dom: perfData.domContentLoadedEventEnd - perfData.responseEnd,
    load: perfData.loadEventEnd - perfData.loadEventStart
  });
});
```

### **Step 3: Image Optimization Analysis (30 minutes)**
```bash
# Analyze current images
# 1. Check image formats (PNG, JPG vs WebP)
# 2. Measure image sizes
# 3. Identify large images
# 4. Check lazy loading implementation

# Commands:
find . -name "*.jpg" -o -name "*.png" | xargs du -sh
# Check for WebP conversion opportunities
```

---

## 🖼️ **Image Optimization Plan**

### **WebP Conversion Strategy**
```bash
# Convert PNG/JPG to WebP
# Tools: cwebp, imagemin-webp, sharp

# Example conversion:
cwebp -q 80 image.jpg -o image.webp

# Batch conversion script:
#!/bin/bash
for img in *.jpg *.png; do
  if [[ -f "$img" ]]; then
    cwebp -q 85 "$img" -o "${img%.*}.webp"
    echo "Converted: $img"
  fi
done
```

### **Image Size Optimization**
- **Hero Images:** Max 1920x1080, < 500KB
- **Thumbnails:** Max 300x300, < 50KB  
- **Icons:** Max 64x64, < 10KB
- **Background Images:** Max 1200x800, < 200KB

### **Lazy Loading Implementation**
```html
<!-- Current implementation -->
<img src="image.jpg" alt="Description" loading="lazy">

<!-- Enhanced with Intersection Observer -->
<img data-src="image.jpg" alt="Description" class="lazy-load">

<script>
const lazyImages = document.querySelectorAll('.lazy-load');
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy-load');
      imageObserver.unobserve(img);
    }
  });
});

lazyImages.forEach(img => imageObserver.observe(img));
</script>
```

---

## 📦 **Cache Optimization Strategy**

### **Cache Headers Configuration**
```javascript
// next.config.js enhancements
module.exports = {
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300' // 5 minutes for API
          }
        ]
      }
    ];
  }
}
```

### **Service Worker Implementation**
```javascript
// public/sw.js
const CACHE_NAME = 'docflow-v1';
const urlsToCache = [
  '/',
  '/_next/static/css/',
  '/_next/static/js/',
  '/images/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
```

---

## 🔧 **Code Optimization Plan**

### **JavaScript Bundle Analysis**
```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your config
});

# Run analysis
ANALYZE=true npm run build
```

### **Code Splitting Optimization**
```javascript
// Dynamic imports for better code splitting
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Loading />
});

// Route-based code splitting is automatic with Next.js
// But we can enhance it:
export async function getStaticProps() {
  // Pre-load critical data
  const criticalData = await fetchCriticalData();
  
  return {
    props: { criticalData }
  };
}
```

### **CSS Optimization**
```css
/* Critical CSS inlining */
/* Above-the-fold styles in <style jsx> */
/* Non-critical styles loaded async */

/* Example critical CSS: */
<style jsx>{`
  .hero {
    background: linear-gradient(...);
    min-height: 100vh;
  }
  
  .hero h1 {
    font-size: 3rem;
    color: white;
  }
`}</style>
```

---

## 📱 **Mobile Performance Plan**

### **Mobile-First Optimization**
- **Touch Targets:** Minimum 44px
- **Font Sizes:** Minimum 16px for readability
- **Scrolling:** Smooth scroll behavior
- **Network:** Optimized for slow connections

### **Mobile-Specific Optimizations**
```javascript
// Detect device and optimize
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
  // Load mobile-optimized images
  // Reduce animation complexity
  // Use smaller bundle
}
```

---

## 🔍 **Database Performance Plan**

### **Query Optimization**
```sql
-- Add indexes for common queries
CREATE INDEX idx_receipts_user_date ON receipts(user_id, created_at);
CREATE INDEX idx_leads_status_date ON leads(status, created_at);

-- Optimize slow queries
EXPLAIN ANALYZE SELECT * FROM receipts WHERE user_id = ? ORDER BY created_at DESC;
```

### **API Response Caching**
```python
# FastAPI caching
from fastapi import FastAPI
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost:6379")
    FastAPICache.init(RedisBackend(redis), prefix="docflow-cache")

@cache(expire=300)  # 5 minutes
async def get_user_receipts(user_id: str):
    return await fetch_receipts(user_id)
```

---

## ⚡ **Performance Testing Script**

### **create_performance_test.py**
```python
#!/usr/bin/env python3
"""Performance testing script for DocFlow."""

import time
import requests
import json
from datetime import datetime

def test_page_load_times():
    """Test page load times."""
    pages = [
        'https://converto.fi',
        'https://converto.fi/dashboard',
        'https://converto.fi/premium'
    ]
    
    results = {}
    for page in pages:
        start_time = time.time()
        response = requests.get(page)
        load_time = time.time() - start_time
        
        results[page] = {
            'load_time': load_time,
            'status_code': response.status_code,
            'content_size': len(response.content),
            'timestamp': datetime.now().isoformat()
        }
    
    return results

def test_api_performance():
    """Test API response times."""
    apis = [
        'https://converto-business-os-quantum-mvp-1.onrender.com/health',
        'https://converto-business-os-quantum-mvp-1.onrender.com/metrics'
    ]
    
    results = {}
    for api in apis:
        start_time = time.time()
        response = requests.get(api)
        response_time = time.time() - start_time
        
        results[api] = {
            'response_time': response_time,
            'status_code': response.status_code,
            'timestamp': datetime.now().isoformat()
        }
    
    return results

if __name__ == "__main__":
    print("🧪 Running performance tests...")
    
    page_results = test_page_load_times()
    api_results = test_api_performance()
    
    print("📊 Page Load Results:")
    for page, result in page_results.items():
        print(f"  {page}: {result['load_time']:.2f}s")
    
    print("⚡ API Response Results:")
    for api, result in api_results.items():
        print(f"  {api}: {result['response_time']:.2f}s")
    
    # Save results
    with open('performance_results.json', 'w') as f:
        json.dump({
            'page_results': page_results,
            'api_results': api_results
        }, f, indent=2)
    
    print("✅ Performance test complete")
```

---

## 📈 **Expected Performance Improvements**

### **Before Optimization (Estimated)**
- **PageSpeed Score:** 65-75
- **Load Time:** 3-4 seconds
- **LCP:** 3-4 seconds
- **Bundle Size:** 2-3MB

### **After Optimization (Target)**
- **PageSpeed Score:** > 90
- **Load Time:** < 2 seconds
- **LCP:** < 2.5 seconds
- **Bundle Size:** < 1MB

### **ROI Benefits**
- **User Experience:** 50% faster load times
- **SEO Ranking:** Better Core Web Vitals scores
- **Conversion Rate:** 20-30% improvement
- **Server Costs:** Reduced bandwidth usage

---

## ✅ **Optimization Checklist**

### **Phase 1: Quick Wins (2 hours)**
- [ ] Convert large images to WebP
- [ ] Implement lazy loading
- [ ] Optimize cache headers
- [ ] Minify CSS and JavaScript
- [ ] Remove unused dependencies

### **Phase 2: Advanced Optimizations (3 hours)**
- [ ] Code splitting optimization
- [ ] Service worker implementation
- [ ] Database query optimization
- [ ] API response caching
- [ ] Critical CSS inlining

### **Phase 3: Monitoring & Validation (1 hour)**
- [ ] Re-run PageSpeed tests
- [ ] Measure Core Web Vitals
- [ ] Test mobile performance
- [ ] Validate improvements
- [ ] Document baseline metrics

---

## 🚀 **Post-Optimization Actions**

### **Continuous Monitoring**
- Set up Core Web Vitals tracking
- Monitor performance regressions
- A/B test performance changes
- Regular performance audits

### **Performance Budget**
- **JavaScript:** < 500KB
- **CSS:** < 100KB
- **Images:** < 1MB total
- **API Response:** < 500ms

---

**Status:** 📋 Performance optimization plan ready  
**Execution:** Thursday 21.11 during sprint  
**Expected Impact:** 50% performance improvement