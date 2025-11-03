'use client';

import HeroSB from './HeroSB';
import ProblemsSB from './ProblemsSB';
import SolutionSB from './SolutionSB';
import PlanSB from './PlanSB';
import CTASB from './CTASB';
import SuccessSB from './SuccessSB';
import CustomerHeroSB from './CustomerHeroSB';
import { StructuredData } from '@/components/seo/StructuredData';
import { TrackPage } from '@/components/analytics/TrackPage';

export default function SBPage() {
  return (
    <TrackPage
      pageName="storybrand_landing"
      pageType="storybrand"
      enableScrollTracking={true}
      enableExitIntent={true}
      additionalProperties={{
        page_version: '1.0',
        framework: 'storybrand',
        sections_count: 7,
        has_structured_data: true,
        mobile_optimized: true,
        seo_optimized: true,
      }}
    >
      <StructuredData />

      <main>
        {/* H1 vain kerran sivulla */}
        <header>
          <HeroSB />
        </header>

        {/* Looginen otsikkorakenne */}
        <section aria-labelledby="customer-hero-title">
          <CustomerHeroSB />
        </section>

        <section aria-labelledby="problems-title">
          <ProblemsSB />
        </section>

        <section aria-labelledby="solution-title">
          <SolutionSB />
        </section>

        <section aria-labelledby="plan-title">
          <PlanSB />
        </section>

        <section aria-labelledby="success-title">
          <SuccessSB />
        </section>

        <section aria-labelledby="cta-title">
          <CTASB />
        </section>
      </main>
    </TrackPage>
  );
}
