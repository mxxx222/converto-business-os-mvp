'use client';

import { useEffect, useState } from 'react';
import { Loader2, Brain, Calculator, CheckCircle2 } from 'lucide-react';

interface ProcessingAnimationProps {
  language?: string;
}

export function ProcessingAnimation({ language = 'fi' }: ProcessingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const t = translations[language] || translations.fi;

  const steps = [
    { icon: Brain, text: t.readingReceipt, duration: 1000 },
    { icon: Calculator, text: t.calculatingVAT, duration: 800 },
    { icon: CheckCircle2, text: t.verifying, duration: 700 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
      <div className="text-center px-6">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
          </div>
          
          {/* Progress rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-white/30 rounded-full animate-ping" />
          </div>
        </div>

        {/* Current Step */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            {t.processing}
          </h2>
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isDone = index < currentStep;

            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all duration-500
                  ${isActive ? 'bg-white/20 scale-105' : 'bg-white/5'}
                  ${isDone ? 'opacity-50' : 'opacity-100'}
                `}
              >
                <Icon className={`
                  w-5 h-5 text-white
                  ${isActive ? 'animate-pulse' : ''}
                `} />
                <span className="text-white text-sm font-medium">
                  {step.text}
                </span>
                {isDone && (
                  <CheckCircle2 className="w-5 h-5 text-green-300 ml-auto" />
                )}
              </div>
            );
          })}
        </div>

        {/* Fun fact */}
        <p className="text-white/70 text-xs mt-8 max-w-xs mx-auto">
          {t.funFact}
        </p>
      </div>
    </div>
  );
}

const translations: Record<string, any> = {
  fi: {
    processing: 'Käsitellään...',
    readingReceipt: 'Luetaan kuittia AI:lla',
    calculatingVAT: 'Lasketaan ALV 25.5%',
    verifying: 'Tarkistetaan tiedot',
    funFact: '💡 Säästät 15 minuuttia per kuitti'
  },
  en: {
    processing: 'Processing...',
    readingReceipt: 'Reading receipt with AI',
    calculatingVAT: 'Calculating VAT 25.5%',
    verifying: 'Verifying data',
    funFact: '💡 You save 15 minutes per receipt'
  },
  ru: {
    processing: 'Обработка...',
    readingReceipt: 'Чтение чека с AI',
    calculatingVAT: 'Расчёт НДС 25.5%',
    verifying: 'Проверка данных',
    funFact: '💡 Вы экономите 15 минут на чек'
  }
};

