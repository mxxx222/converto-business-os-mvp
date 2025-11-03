'use client';

import HeroSB from './HeroSB';
import ProblemsSB from './ProblemsSB';
import SolutionSB from './SolutionSB';
import PlanSB from './PlanSB';
import CTASB from './CTASB';
import SuccessSB from './SuccessSB';
import CustomerHeroSB from './CustomerHeroSB';
import { StructuredData } from '@/components/seo/StructuredData';

export default function SBPage() {
  return (
    <>
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
    </>
  );
}
