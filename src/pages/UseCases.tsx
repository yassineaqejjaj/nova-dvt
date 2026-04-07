import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';
import { Diamond, Search, Lightbulb, PenTool, Rocket, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const UseCases: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ─── Hero ─── */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>{t('useCases.hero.label')}</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              {t('useCases.hero.h1.1')}<br />{t('useCases.hero.h1.2')}
            </h1>
            <p className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}>
              {t('useCases.hero.desc')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Double Diamond Visual ─── */}
      <Section bg="" className="bg-white">
        <Reveal>
          <div className="text-center mb-16">
            <Label>{t('useCases.how.label')}</Label>
            <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>
              {t('useCases.how.h2')}
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A', maxWidth: 600, margin: '0 auto' }}>
              {t('useCases.how.desc')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-6">
            {[
              { label: t('useCases.discover'), icon: Search, color: '#6366F1', desc: t('useCases.diverge') },
              { label: t('useCases.define'), icon: Lightbulb, color: '#F8485E', desc: t('useCases.converge') },
              { label: t('useCases.develop'), icon: PenTool, color: '#6366F1', desc: t('useCases.diverge') },
              { label: t('useCases.deliver'), icon: Rocket, color: '#F8485E', desc: t('useCases.converge') },
            ].map((phase, i) => (
              <div key={phase.label} className="relative flex flex-col items-center">
                <div className="w-20 h-20 flex items-center justify-center rotate-45 mb-4" style={{ background: phase.color }}>
                  <phase.icon size={28} strokeWidth={1.5} className="-rotate-45 text-white" />
                </div>
                <span className="text-xs uppercase tracking-[0.15em] font-bold mb-1" style={{ color: phase.color }}>{phase.desc}</span>
                <span className="font-bold text-lg" style={{ color: '#141413' }}>{phase.label}</span>
                {i < 3 && <ArrowRight size={16} className="absolute right-0 top-8 hidden md:block" style={{ color: '#D1D1D1', transform: 'translateX(50%)' }} />}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#6366F1' }} />
              <span className="text-sm" style={{ color: '#3C3C3A' }}>{t('useCases.diamond1')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#F8485E' }} />
              <span className="text-sm" style={{ color: '#3C3C3A' }}>{t('useCases.diamond2')}</span>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ─── Phase 1: Discover ─── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rotate-45" style={{ background: '#6366F1' }}>
                  <Search size={18} strokeWidth={1.5} className="-rotate-45 text-white" />
                </div>
                <Label>{t('useCases.phase1.label')}</Label>
              </div>
              <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>{t('useCases.phase1.h2')}</h2>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{t('useCases.phase1.desc')}</p>
            </div>
            <div>
              <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t('useCases.phase1.tools')}</p>
              <ul className="space-y-3 mb-8">
                {[t('useCases.phase1.b1'), t('useCases.phase1.b2'), t('useCases.phase1.b3'), t('useCases.phase1.b4'), t('useCases.phase1.b5')].map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 shrink-0 rounded-full" style={{ background: '#6366F1' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>{t('useCases.phase1.footer')}</p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ─── Phase 2: Define ─── */}
      <Section bg="" className="bg-white">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rotate-45" style={{ background: '#F8485E' }}>
                  <Lightbulb size={18} strokeWidth={1.5} className="-rotate-45 text-white" />
                </div>
                <Label>{t('useCases.phase2.label')}</Label>
              </div>
              <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>{t('useCases.phase2.h2')}</h2>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{t('useCases.phase2.desc')}</p>
            </div>
            <div>
              <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#F8485E', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t('useCases.phase1.tools')}</p>
              <ul className="space-y-3 mb-8">
                {[t('useCases.phase2.b1'), t('useCases.phase2.b2'), t('useCases.phase2.b3'), t('useCases.phase2.b4'), t('useCases.phase2.b5')].map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 shrink-0 rounded-full" style={{ background: '#F8485E' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>{t('useCases.phase2.footer')}</p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ─── Phase 3: Develop ─── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rotate-45" style={{ background: '#6366F1' }}>
                  <PenTool size={18} strokeWidth={1.5} className="-rotate-45 text-white" />
                </div>
                <Label>{t('useCases.phase3.label')}</Label>
              </div>
              <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>{t('useCases.phase3.h2')}</h2>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{t('useCases.phase3.desc')}</p>
            </div>
            <div>
              <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t('useCases.phase1.tools')}</p>
              <ul className="space-y-3 mb-8">
                {[t('useCases.phase3.b1'), t('useCases.phase3.b2'), t('useCases.phase3.b3'), t('useCases.phase3.b4'), t('useCases.phase3.b5')].map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 shrink-0 rounded-full" style={{ background: '#6366F1' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>{t('useCases.phase3.footer')}</p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ─── Phase 4: Deliver ─── */}
      <Section bg="" className="bg-white">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center rotate-45" style={{ background: '#F8485E' }}>
                  <Rocket size={18} strokeWidth={1.5} className="-rotate-45 text-white" />
                </div>
                <Label>{t('useCases.phase4.label')}</Label>
              </div>
              <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>{t('useCases.phase4.h2')}</h2>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{t('useCases.phase4.desc')}</p>
            </div>
            <div>
              <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#F8485E', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{t('useCases.phase1.tools')}</p>
              <ul className="space-y-3 mb-8">
                {[t('useCases.phase4.b1'), t('useCases.phase4.b2'), t('useCases.phase4.b3'), t('useCases.phase4.b4'), t('useCases.phase4.b5')].map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 shrink-0 rounded-full" style={{ background: '#F8485E' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>{t('useCases.phase4.footer')}</p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ─── Why it matters ─── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal>
          <div className="text-center mb-12">
            <Label>{t('useCases.why.label')}</Label>
            <h2 className="mb-6" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>{t('useCases.why.h2')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: t('useCases.why.1.title'), desc: t('useCases.why.1.desc') },
              { title: t('useCases.why.2.title'), desc: t('useCases.why.2.desc') },
              { title: t('useCases.why.3.title'), desc: t('useCases.why.3.desc') },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="mb-3" style={{ fontSize: 20, fontWeight: 700, color: '#141413' }}>{item.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ─── Bottom line ─── */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '120px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-4" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>{t('useCases.bottom.h2')}</h2>
            <p className="text-white/50 mb-10" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>{t('useCases.bottom.sub')}</p>
            <PrimaryBtn onClick={() => navigate('/demo')}>{t('nav.demo')}</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default UseCases;
