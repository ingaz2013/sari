import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Pricing() {
  const { t } = useTranslation();

  const plans = [
    {
      name: t('pricing.plans.basic.name'),
      nameEn: 'Starter',
      price: 90,
      period: t('pricing.plans.basic.period'),
      description: t('pricing.plans.basic.description'),
      features: [
        t('pricing.plans.basic.features.0'),
        t('pricing.plans.basic.features.1'),
        t('pricing.plans.basic.features.2'),
        t('pricing.plans.basic.features.3'),
        t('pricing.plans.basic.features.4'),
        t('pricing.plans.basic.features.5'),
      ],
      popular: false,
    },
    {
      name: t('pricing.plans.growth.name'),
      nameEn: 'Growth',
      price: 230,
      period: t('pricing.plans.growth.period'),
      description: t('pricing.plans.growth.description'),
      features: [
        t('pricing.plans.growth.features.0'),
        t('pricing.plans.growth.features.1'),
        t('pricing.plans.growth.features.2'),
        t('pricing.plans.growth.features.3'),
        t('pricing.plans.growth.features.4'),
        t('pricing.plans.growth.features.5'),
        t('pricing.plans.growth.features.6'),
        t('pricing.plans.growth.features.7'),
      ],
      popular: true,
    },
    {
      name: t('pricing.plans.professional.name'),
      nameEn: 'Professional',
      price: 845,
      period: t('pricing.plans.professional.period'),
      description: t('pricing.plans.professional.description'),
      features: [
        t('pricing.plans.professional.features.0'),
        t('pricing.plans.professional.features.1'),
        t('pricing.plans.professional.features.2'),
        t('pricing.plans.professional.features.3'),
        t('pricing.plans.professional.features.4'),
        t('pricing.plans.professional.features.5'),
        t('pricing.plans.professional.features.6'),
        t('pricing.plans.professional.features.7'),
        t('pricing.plans.professional.features.8'),
        t('pricing.plans.professional.features.9'),
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: t('pricing.faqs.0.question'),
      answer: t('pricing.faqs.0.answer'),
    },
    {
      question: t('pricing.faqs.1.question'),
      answer: t('pricing.faqs.1.answer'),
    },
    {
      question: t('pricing.faqs.2.question'),
      answer: t('pricing.faqs.2.answer'),
    },
    {
      question: t('pricing.faqs.3.question'),
      answer: t('pricing.faqs.3.answer'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
        <div className="container relative py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-primary">
                {t('pricing.hero.title')}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('pricing.hero.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.nameEn}
                className={`relative border-2 ${
                  plan.popular
                    ? 'border-primary shadow-xl scale-105'
                    : 'border-border hover:border-primary/30 dark:hover:border-blue-800'
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      {t('pricing.popular')}
                    </div>
                  </div>
                )}

                <CardHeader className="text-center space-y-4 pt-8">
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.nameEn}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{t('pricing.currency')}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{plan.period}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/login">
                    <a className="block">
                      <Button
                        className={`w-full ${
                          plan.popular
                            ? 'bg-primary hover:bg-primary/90'
                            : ''
                        }`}
                        variant={plan.popular ? 'default' : 'outline'}
                        size="lg"
                      >
                        {t('pricing.startNow')}
                        <ArrowRight className="mr-2 w-4 h-4" />
                      </Button>
                    </a>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              {t('pricing.vatNote')}
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('pricing.faq.title')}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t('pricing.faq.subtitle')}
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.question}>
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            {t('pricing.cta.title')}
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t('pricing.cta.subtitle')}
          </p>
          <Link href="/login">
            <a>
              <Button size="lg" variant="secondary" className="text-lg h-14 px-8">
                {t('pricing.cta.button')}
                <ArrowRight className="mr-2 w-5 h-5" />
              </Button>
            </a>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
