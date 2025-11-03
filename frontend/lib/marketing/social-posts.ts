/**
 * Social Media Posts for Launch Campaign
 */

export interface SocialPost {
  text: string;
  hashtags: string[];
  image?: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram';
}

export const socialMediaPosts: Record<string, SocialPost[]> = {
  twitter: [
    {
      platform: 'twitter',
      text: `🚀 LIVE NOW: Converto Business OS is here!

Save 10 hours/week on manual processes.

Eliminate verovirhe-risks with AI.

Get 3-month ROI guaranteed.

Start your free 30-day trial: https://converto.fi/business-os/pilot

#Automation #AI #Finnish #Startup`,
      hashtags: ['#Automation', '#AI', '#Finnish', '#Startup', '#BusinessAutomation'],
      image: 'launch-hero.png',
    },
    {
      platform: 'twitter',
      text: `Did you know? 40% of business time is wasted on manual processes.

Converto automates 90% of them. ✨

Try it free: https://converto.fi/business-os/pilot

#Productivity #Automation`,
      hashtags: ['#Productivity', '#Automation', '#BusinessTips'],
      image: 'stat-40-percent.png',
    },
    {
      platform: 'twitter',
      text: `Real customer story 📊

Ravintola Kala & Kivi:
• Saved 13 hours/week
• Eliminated verovirhe-risks
• ROI in 3 months

"Converto changed how we manage finances." – Petri

Your story could be next 👇
https://converto.fi`,
      hashtags: ['#CustomerStory', '#CaseStudy', '#Automation'],
      image: 'case-study-kala-kivi.png',
    },
    {
      platform: 'twitter',
      text: `ALV-laskenta, kuittien käsittely, raportointi...

All automated. ✅

Converto handles the boring stuff so you can focus on growing your business.

Free trial: https://converto.fi/business-os/pilot

#SmallBusiness #Automation`,
      hashtags: ['#SmallBusiness', '#Automation', '#Finnish'],
      image: 'features-overview.png',
    },
  ],
  linkedin: [
    {
      platform: 'linkedin',
      text: `Excited to announce the launch of Converto Business OS! 🚀

After months of development, we've built an AI-powered automation platform that helps Finnish businesses:

✓ Save 10 hours/week on manual processes
✓ Eliminate errors with AI verification
✓ Achieve 3-month ROI
✓ Get real-time business insights

We've already helped 50+ companies automate 90% of their manual work.

Ready to transform your business? Start your free trial today.

#Startup #AI #Automation #BusinessTech`,
      hashtags: ['#Startup', '#AI', '#Automation', '#BusinessTech'],
      image: 'launch-announcement.png',
    },
    {
      platform: 'linkedin',
      text: `The Problem: 40% of business time is wasted on manual processes.

The Solution: Converto Business OS

Our AI-powered platform automates:
• Receipt processing & expense tracking
• VAT calculations & compliance
• Financial reporting
• Team collaboration

Result: 10+ hours saved per week, zero errors, 3-month ROI.

Join 50+ Finnish businesses already using Converto.

#Automation #AI #BusinessIntelligence`,
      hashtags: ['#Automation', '#AI', '#BusinessIntelligence'],
      image: 'problem-solution.png',
    },
  ],
  facebook: [
    {
      platform: 'facebook',
      text: `🎉 Converto is LIVE!

Tired of spending hours on manual bookkeeping? Tired of verovirhe-risks?

Converto automates it all with AI. ✨

✓ Save 10 hours/week
✓ Zero errors
✓ 3-month ROI
✓ Real-time insights

Start your FREE 30-day trial today!

👉 https://converto.fi/business-os/pilot`,
      hashtags: ['#Automation', '#SmallBusiness', '#Finnish'],
      image: 'launch-hero.png',
    },
  ],
  instagram: [
    {
      platform: 'instagram',
      text: `🚀 Converto is LIVE!

Save 10 hours/week on manual processes with AI automation.

• OCR-powered receipt tracking
• Automatic VAT calculations
• Real-time business insights
• 99.95% uptime

Start your free trial today! 👇
Link in bio 🔗

#Automation #AI #BusinessOS #SmallBusiness #FinnishTech`,
      hashtags: ['#Automation', '#AI', '#BusinessOS', '#SmallBusiness', '#FinnishTech'],
      image: 'launch-hero.png',
    },
  ],
};

/**
 * Get all posts for a specific platform
 */
export function getPostsForPlatform(platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram'): SocialPost[] {
  return socialMediaPosts[platform] || [];
}

/**
 * Get all posts (all platforms)
 */
export function getAllPosts(): SocialPost[] {
  return Object.values(socialMediaPosts).flat();
}

