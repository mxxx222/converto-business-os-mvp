/**
 * Email Nurture Sequences for User Acquisition & Retention
 */

export interface EmailCampaign {
  delay: number; // minutes
  subject: string;
  template: string;
  goal: string;
}

export const emailSequences = {
  signupSequence: [
    {
      delay: 0,
      subject: '🚀 Tervetuloa Convertoon!',
      template: 'welcome',
      goal: 'Confirm email + set expectations',
    },
    {
      delay: 1440,
      subject: '⚡ Näytän sinulle 3 minuutissa miten se toimii',
      template: 'demo_video',
      goal: 'Engagement + feature discovery',
    },
    {
      delay: 2880,
      subject: '💰 Näytä ROI-laskuri - kuinka paljon säästät?',
      template: 'roi_calculator',
      goal: 'Value realization',
    },
    {
      delay: 4320,
      subject: '👥 Katso miten muut yritykset käyttävät Convertoa',
      template: 'case_studies',
      goal: 'Social proof',
    },
    {
      delay: 5760,
      subject: '❓ Onko sinulla kysymyksiä? Vastaamme 24h sisällä',
      template: 'support_offer',
      goal: 'Support + reduce friction',
    },
  ],
  trialEndingSequence: [
    {
      delay: -604800,
      subject: '⏰ Pilottisi päättyy 7 päivässä - jatka nyt',
      template: 'trial_ending_7days',
      goal: 'Conversion push',
    },
    {
      delay: -259200,
      subject: '⏰ 3 päivää jäljellä - älä menetä pääsyä',
      template: 'trial_ending_3days',
      goal: 'Urgency',
    },
    {
      delay: -86400,
      subject: '⏰ Viimeinen päivä - jatka nyt 50% alennuksella',
      template: 'trial_ending_1day_discount',
      goal: 'Last chance + incentive',
    },
  ],
  churnRecoverySequence: [
    {
      delay: 0,
      subject: '😢 Miksi lähdit? Haluamme auttaa',
      template: 'churn_feedback',
      goal: 'Feedback + re-engagement',
    },
    {
      delay: 604800,
      subject: '🎁 Palaa takaisin - 30% alennus 3 kuukautta',
      template: 'churn_recovery_offer',
      goal: 'Win-back',
    },
  ],
} as const;

