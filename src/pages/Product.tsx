import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, TertiaryLink, LandingHeader, LandingFooter } from './Landing';
import { useLanguage } from '@/contexts/LanguageContext';
import productMockup from '@/assets/product-mockup.jpg';

const Product: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ─── Hero ─── */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>{t('product.hero.label')}</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              {t('product.hero.h1')}
            </h1>
            <p className="text-white/60 mb-4" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}>
              {t('product.hero.p1')}<br />
              {t('product.hero.p2')}<br />
              {t('product.hero.p3')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <Section bg="bg-white">
        <Reveal className="mb-16">
          <Label>{t('product.how.label')}</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            {t('product.how.h2')}
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              num: '1',
              label: t('product.how.1.label'),
              title: t('product.how.1.title'),
              bullets: [t('product.how.1.b1'), t('product.how.1.b2'), t('product.how.1.b3')],
              footer: t('product.how.1.footer'),
            },
            {
              num: '2',
              label: t('product.how.2.label'),
              title: t('product.how.2.title'),
              bullets: [t('product.how.2.b1'), t('product.how.2.b2'), t('product.how.2.b3'), t('product.how.2.b4')],
              footer: t('product.how.2.footer'),
            },
            {
              num: '3',
              label: t('product.how.3.label'),
              title: t('product.how.3.title'),
              bullets: [t('product.how.3.b1'), t('product.how.3.b2'), t('product.how.3.b3'), t('product.how.3.b4')],
              footer: t('product.how.3.footer'),
            },
          ].map((layer, i) => (
            <Reveal key={layer.num} delay={i * 0.15}>
              <div className="mb-4">
                <span className="inline-block w-10 h-10 text-center leading-10 font-bold text-white" style={{ background: '#F8485E', fontSize: 18 }}>
                  {layer.num}
                </span>
              </div>
              <Label>{layer.label}</Label>
              <h3 className="mb-4" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px', color: '#141413' }}>{layer.title}</h3>
              <ul className="space-y-2 mb-6">
                {layer.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 shrink-0" style={{ background: '#F8485E' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{layer.footer}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ─── What makes Nova different ─── */}
      <section style={{ background: '#3C3C3A' }}>
        <div className="mx-auto grid md:grid-cols-2 gap-16 items-center" style={{ maxWidth: 1200, padding: '100px 60px' }}>
          <Reveal>
            <Label>{t('product.diff.label')}</Label>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              {t('product.diff.h2.1')}<br />{t('product.diff.h2.2')}
            </h2>
            <ul className="space-y-4">
              {[t('product.diff.b1'), t('product.diff.b2'), t('product.diff.b3'), t('product.diff.b4')].map((item) => (
                <li key={item} className="flex items-start gap-4 text-white/80">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.2}>
            <img src={productMockup} alt="Nova workspace" className="w-full shadow-2xl" loading="lazy" width={1200} height={800} style={{ borderRadius: 0 }} />
          </Reveal>
        </div>
      </section>

      {/* ─── What you get ─── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal className="mb-16">
          <Label>{t('product.get.label')}</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            {t('product.get.h2')}
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[t('product.get.1'), t('product.get.2'), t('product.get.3'), t('product.get.4')].map((item, i) => (
            <Reveal key={item} delay={i * 0.1}>
              <div className="p-6" style={{ background: '#FFFFFF', borderRadius: 0 }}>
                <span className="inline-block w-8 h-8 text-center leading-8 font-bold text-white mb-4" style={{ background: '#F8485E', fontSize: 14 }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>{item}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ─── CTA ─── */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '120px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              {t('product.cta.h2')}
            </h2>
            <PrimaryBtn onClick={() => navigate('/demo')}>{t('nav.demo')}</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Product;
