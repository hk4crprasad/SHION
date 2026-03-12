'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Crown, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for getting started with AI-powered research.',
    cta: 'Get started',
    href: '/signup',
    highlight: false,
    features: [
      '20 searches per day',
      'Standard AI models',
      'Basic research mode',
      'Discover feed access',
      'PDF & Markdown export',
    ],
    missing: [
      'Deep Research mode',
      'Priority processing',
      'Advanced AI models',
      'API access',
    ],
  },
  {
    name: 'Pro',
    monthlyPrice: 799,
    yearlyPrice: 639,
    description: 'Unlock the full power of SHION for serious researchers.',
    cta: 'Upgrade to Pro',
    href: '#upgrade',
    highlight: true,
    features: [
      'Unlimited searches',
      'Deep Research mode',
      'Advanced AI models (GPT-4 class)',
      'Priority processing',
      'All export formats',
      'Personalization settings',
      'Early access to new features',
    ],
    missing: ['API access'],
  },
  {
    name: 'Enterprise',
    monthlyPrice: 1999,
    yearlyPrice: 1599,
    description: 'For teams and organizations that need full control.',
    cta: 'Contact us',
    href: 'mailto:hello@cynerza.in',
    highlight: false,
    features: [
      'Everything in Pro',
      'API access',
      'Team collaboration',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Custom billing',
    ],
    missing: [],
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  const handleUpgrade = async () => {
    const res = await fetch('/api/subscription/create', { method: 'POST' });
    if (res.ok) {
      const { paymentUrl } = await res.json();
      window.location.href = paymentUrl;
    }
  };

  return (
    <div className="min-h-screen bg-light-primary dark:bg-dark-primary">
      <div className="max-w-6xl mx-auto px-4 py-16 lg:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 dark:text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <Crown size={12} />
            <span>SHION Premium</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-base text-black/50 dark:text-white/50 max-w-xl mx-auto">
            Choose the plan that fits your research needs. Upgrade or downgrade
            at any time.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span
              className={`text-sm font-medium transition-colors ${
                !yearly
                  ? 'text-black dark:text-white'
                  : 'text-black/40 dark:text-white/40'
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                yearly ? 'bg-blue-600' : 'bg-light-200 dark:bg-dark-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                  yearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium transition-colors ${
                yearly
                  ? 'text-black dark:text-white'
                  : 'text-black/40 dark:text-white/40'
              }`}
            >
              Yearly
              <span className="ml-1.5 inline-block text-xs font-semibold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 lg:p-8 flex flex-col ${
                plan.highlight
                  ? 'border-blue-500/60 bg-blue-500/5 dark:bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-light-200 dark:border-dark-200 bg-light-secondary dark:bg-dark-secondary'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    <Zap size={10} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-semibold text-black dark:text-white mb-1">
                  {plan.name}
                </h2>
                <p className="text-sm text-black/50 dark:text-white/50">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                {plan.monthlyPrice === 0 ? (
                  <div className="text-4xl font-bold text-black dark:text-white">
                    Free
                  </div>
                ) : (
                  <div className="flex items-end gap-1">
                    <span className="text-sm text-black/50 dark:text-white/50 mb-1">
                      ₹
                    </span>
                    <span className="text-4xl font-bold text-black dark:text-white">
                      {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-sm text-black/50 dark:text-white/50 mb-1">
                      / mo
                    </span>
                  </div>
                )}
                {plan.monthlyPrice > 0 && yearly && (
                  <p className="text-xs text-black/40 dark:text-white/40 mt-1">
                    Billed as ₹{plan.yearlyPrice * 12}/yr
                  </p>
                )}
              </div>

              <div className="mb-8 flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-black/80 dark:text-white/80"
                    >
                      <Check
                        size={16}
                        className="text-green-500 flex-shrink-0 mt-0.5"
                      />
                      {feature}
                    </li>
                  ))}
                  {plan.missing.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-black/30 dark:text-white/30 line-through"
                    >
                      <span className="w-4 h-4 flex-shrink-0 mt-0.5 text-center text-black/20 dark:text-white/20">
                        ×
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {plan.href === '#upgrade' ? (
                <button
                  onClick={handleUpgrade}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-light-200 dark:bg-dark-200 hover:bg-light-200/80 dark:hover:bg-dark-200/80 text-black dark:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href={plan.href}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-center transition-colors block ${
                    plan.highlight
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-light-200 dark:bg-dark-200 hover:bg-light-200/80 dark:hover:bg-dark-200/80 text-black dark:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-black/40 dark:text-white/40 mt-10">
          All prices are in INR and exclude applicable taxes. Payments are
          processed securely via Razorpay. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
