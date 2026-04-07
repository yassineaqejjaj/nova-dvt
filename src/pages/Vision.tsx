import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';
import { useLanguage } from '@/contexts/LanguageContext';

const Vision: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ─── Hero ─── */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>{t('vision.hero.label')}</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              {t('vision.hero.h1')}
            </h1>
            <p className="text-white/50 mb-2" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>
              {t('vision.hero.sub')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── A simple shift ─── */}
      <Section bg="bg-white">
        <Reveal className="max-w-2xl">
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            {t('vision.shift.h2')}
          </h2>
          <div className="space-y-6" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <p>{t('vision.shift.p1')}<br />{t('vision.shift.p1b')}</p>
            <p>{t('vision.shift.p2')}</p>
            <p>{t('vision.shift.p3a')}<br />{t('vision.shift.p3b')}<br />{t('vision.shift.p3c')}</p>
            <p style={{ fontWeight: 700, color: '#141413' }}>{t('vision.shift.p4')}</p>
          </div>
        </Reveal>
      </Section>

      {/* ─── Our vision ─── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal className="max-w-2xl">
          <Label>{t('vision.our.label')}</Label>
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            {t('vision.our.h2')}
          </h2>
          <div className="space-y-6" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <p>{t('vision.our.p1')}<br />{t('vision.our.p1b')}</p>
            <p style={{ fontWeight: 700, color: '#141413' }}>{t('vision.our.p2')}</p>
            <ul className="space-y-4">
              {[t('vision.our.b1'), t('vision.our.b2'), t('vision.our.b3')].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* ─── Why Nova exists ─── */}
      <Section bg="bg-white">
        <Reveal className="max-w-2xl">
          <Label>{t('vision.why.label')}</Label>
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            {t('vision.why.h2')}
          </h2>
          <div className="space-y-6" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <p>{t('vision.why.p1')}<br />{t('vision.why.p1b')}<br />{t('vision.why.p1c')}</p>
            <p style={{ fontWeight: 700, color: '#141413' }}>{t('vision.why.p2')}</p>
            <ul className="space-y-3">
              {[t('vision.why.b1'), t('vision.why.b2'), t('vision.why.b3')].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontWeight: 700, color: '#141413' }}>{t('vision.why.p3')}</p>
            <p>{t('vision.why.p4')}</p>
            <ul className="space-y-3">
              {[t('vision.why.b4'), t('vision.why.b5'), t('vision.why.b6')].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* ─── What Nova changes ─── */}
      <section style={{ background: '#3C3C3A' }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px' }}>
          <Reveal className="max-w-2xl">
            <Label>{t('vision.change.label')}</Label>
            <h2 className="text-white mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              {t('vision.change.h2.1')}<br />{t('vision.change.h2.2')}
            </h2>
            <p className="text-white/60 mb-8" style={{ fontSize: 16, lineHeight: 1.6 }}>
              {t('vision.change.desc.1')}<br />{t('vision.change.desc.2')}
            </p>
            <ul className="space-y-4 mb-12">
              {[t('vision.change.b1'), t('vision.change.b2'), t('vision.change.b3')].map((item) => (
                <li key={item} className="flex items-start gap-4 text-white/80">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { metric: t('vision.change.m1'), label: t('vision.change.m1l') },
                { metric: t('vision.change.m2'), label: t('vision.change.m2l') },
                { metric: t('vision.change.m3'), label: t('vision.change.m3l') },
              ].map((r) => (
                <div key={r.label}>
                  <div className="text-white" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>{r.metric}</div>
                  <p className="text-white/50 text-sm mt-1">{r.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Our ambition ─── */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '120px 60px' }}>
          <Reveal>
            <Label>{t('vision.ambition.label')}</Label>
            <h2 className="text-white mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              {t('vision.ambition.h2')}
            </h2>
            <div className="max-w-xl mx-auto space-y-4 mb-12">
              {[t('vision.ambition.b1'), t('vision.ambition.b2'), t('vision.ambition.b3')].map((item) => (
                <p key={item} className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</p>
              ))}
            </div>
            <p className="text-white mb-2" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>
              {t('vision.ambition.p1')}
            </p>
            <p className="text-white/50 mb-10" style={{ fontSize: 16, lineHeight: 1.6 }}>
              {t('vision.ambition.p2')}
            </p>
            <PrimaryBtn onClick={() => navigate('/demo')}>{t('nav.demo')}</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Vision;
