import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthDialog } from '@/components/AuthDialog';
import { motion, useInView } from 'framer-motion';
import { Rocket, Search, CalendarClock, MessageSquareText } from 'lucide-react';
import { useLanguage, Lang } from '@/contexts/LanguageContext';
import heroBg from '@/assets/hero-bg.jpg';
import productMockup from '@/assets/product-mockup.jpg';

/* ─── shared helpers (exported for sub-pages) ─── */
export const Section: React.FC<{
  children: React.ReactNode;
  bg?: string;
  className?: string;
  id?: string;
}> = ({ children, bg = 'bg-white', className = '', id }) => (
  <section id={id} className={`${bg} ${className}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
    <div className="mx-auto w-full" style={{ maxWidth: 1200, padding: '100px 60px' }}>
      {children}
    </div>
  </section>
);

export const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="uppercase tracking-[0.15em] inline-block mb-4"
    style={{ fontSize: 13, fontWeight: 700, color: '#F8485E' }}
  >
    {children}
  </span>
);

export const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 px-8 py-3 text-white font-semibold text-sm transition-all hover:brightness-110"
    style={{ background: '#F8485E', borderRadius: 50 }}
  >
    {children}
  </button>
);

export const SecondaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-sm border border-white text-white transition-all hover:bg-white/10"
    style={{ borderRadius: 50 }}
  >
    {children}
  </button>
);

export const SecondaryBtnDark: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold text-sm border transition-all hover:bg-[#141413]/5"
    style={{ borderRadius: 50, borderColor: '#3C3C3A', color: '#3C3C3A' }}
  >
    {children}
  </button>
);

export const TertiaryLink: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <span onClick={onClick} className="inline-flex items-center gap-1 font-bold text-sm cursor-pointer hover:gap-2 transition-all" style={{ color: '#F8485E' }}>
    → {children}
  </span>
);

/* ─── Language Switcher ─── */
const LanguageSwitcher: React.FC<{ variant?: 'light' | 'dark' }> = ({ variant = 'light' }) => {
  const { lang, setLang } = useLanguage();
  const base = variant === 'light' ? 'text-white/70' : 'text-[#3C3C3A]/70';
  const active = variant === 'light' ? 'text-white font-bold' : 'text-[#3C3C3A] font-bold';
  return (
    <div className="flex items-center gap-1 text-sm">
      <button onClick={() => setLang('fr')} className={`px-1.5 py-0.5 transition-colors ${lang === 'fr' ? active : base} hover:opacity-80`}>FR</button>
      <span className={base}>/</span>
      <button onClick={() => setLang('en')} className={`px-1.5 py-0.5 transition-colors ${lang === 'en' ? active : base} hover:opacity-80`}>EN</button>
    </div>
  );
};

export const LandingHeader: React.FC<{ onDemo: () => void }> = ({ onDemo }) => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(20,20,19,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 1200, padding: '0 60px', height: 72 }}>
        <span
          onClick={() => navigate('/')}
          className="text-white font-bold cursor-pointer hover:opacity-80 transition-opacity"
          style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.02em' }}
        >
          AI Factory
        </span>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: t('nav.vision'), path: '/vision' },
            { label: t('nav.product'), path: '/product' },
            { label: t('nav.useCases'), path: '/use-cases' },
            { label: t('nav.security'), path: '/#security' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.path.startsWith('/#')) {
                  navigate('/');
                  setTimeout(() => document.getElementById(item.path.slice(2))?.scrollIntoView({ behavior: 'smooth' }), 100);
                } else {
                  navigate(item.path);
                }
              }}
              className="text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => navigate('/?auth=login')}
            className="text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            {t('nav.login')}
          </button>
          <LanguageSwitcher variant="light" />
          <PrimaryBtn onClick={onDemo}>{t('nav.demo')}</PrimaryBtn>
        </nav>
      </div>
    </header>
  );
};

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <footer style={{ background: '#141413', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="mx-auto" style={{ maxWidth: 1200, padding: '60px 60px 40px' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {[
            { title: 'Nova', links: [{ label: t('footer.overview'), path: '/' }, { label: t('footer.features'), path: '/product' }] },
            { title: t('nav.product'), links: [{ label: t('footer.agents'), path: '/product' }, { label: t('footer.workflows'), path: '/product' }, { label: t('footer.artefacts'), path: '/product' }] },
            { title: 'AI Factory', links: [{ label: t('footer.vision'), path: '/vision' }, { label: t('footer.useCases'), path: '/use-cases' }] },
            { title: 'Devoteam', links: [{ label: t('footer.about'), path: '/' }, { label: t('footer.contact'), path: '/demo' }] },
          ].map((col) => (
            <div key={col.title}>
              <h5 className="text-white font-bold text-sm mb-4">{col.title}</h5>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <span
                      onClick={() => navigate(link.path)}
                      className="text-white/40 text-sm hover:text-white/70 transition-colors cursor-pointer"
                    >
                      {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-8">
          <span className="text-white/40 font-bold text-sm">AI Factory</span>
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Nova by Devoteam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

/* ─── LANDING ─── */
const Landing: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const openAuth = (tab: 'signin' | 'signup') => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ───────── HERO ───────── */}
      <section className="relative min-h-screen flex items-end overflow-hidden" style={{ background: '#141413' }}>
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
        <div className="relative z-10 mx-auto w-full" style={{ maxWidth: 1200, padding: '0 60px 80px' }}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} className="max-w-2xl">
            <Label>{t('landing.hero.label')}</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              {t('landing.hero.h1.1')}<br />
              {t('landing.hero.h1.2')}
            </h1>
            <p className="text-white/70 mb-10" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 520 }}>
              {t('landing.hero.desc')}
            </p>
            <div className="flex flex-wrap gap-4 mb-16">
              <PrimaryBtn onClick={() => navigate('/discover')}>{t('landing.hero.cta1')}</PrimaryBtn>
              <SecondaryBtn onClick={() => navigate('/demo')}>{t('nav.demo')}</SecondaryBtn>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }} className="flex gap-10 border-t border-white/10 pt-8">
            {[t('landing.hero.tag1'), t('landing.hero.tag2'), t('landing.hero.tag3')].map((f) => (
              <span key={f} className="text-white/50 text-sm font-medium tracking-wide">{f}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── MANIFEST ───────── */}
      <Section bg="bg-white">
        <Reveal className="text-center max-w-3xl mx-auto">
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }} className="mb-6">
            {t('landing.manifest.h2.1')}<br />{t('landing.manifest.h2.2')}
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{t('landing.manifest.desc')}</p>
        </Reveal>
      </Section>

      {/* ───────── VALUE BLOCKS ───────── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { label: t('landing.value.context.label'), title: t('landing.value.context.title'), text: t('landing.value.context.text') },
            { label: t('landing.value.agents.label'), title: t('landing.value.agents.title'), text: t('landing.value.agents.text') },
            { label: t('landing.value.flow.label'), title: t('landing.value.flow.title'), text: t('landing.value.flow.text') },
          ].map((block, i) => (
            <Reveal key={block.label} delay={i * 0.15}>
              <Label>{block.label}</Label>
              <h3 className="mb-4" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px', color: '#141413' }}>{block.title}</h3>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{block.text}</p>
              <TertiaryLink onClick={() => navigate('/product')}>{t('landing.value.cta')}</TertiaryLink>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────── PRODUCT IMMERSIVE ───────── */}
      <section id="product" style={{ background: '#3C3C3A' }}>
        <div className="mx-auto grid md:grid-cols-2 gap-12 items-center" style={{ maxWidth: 1200, padding: '100px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              {t('landing.product.h2.1')}<br />{t('landing.product.h2.2')}
            </h2>
            <p className="text-white/60 mb-8" style={{ fontSize: 16, lineHeight: 1.6 }}>{t('landing.product.desc')}</p>
            <PrimaryBtn onClick={() => navigate('/product')}>{t('landing.product.cta')}</PrimaryBtn>
          </Reveal>
          <Reveal delay={0.2}>
            <img src={productMockup} alt="Nova workspace" className="w-full shadow-2xl" loading="lazy" width={1200} height={800} style={{ borderRadius: 0 }} />
          </Reveal>
        </div>
      </section>

      {/* ───────── USE CASES ───────── */}
      <Section bg="bg-white" id="use-cases-preview">
        <Reveal className="mb-16">
          <Label>{t('landing.useCases.label')}</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>{t('landing.useCases.h2')}</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { labelKey: 'landing.useCases.onboarding.label', titleKey: 'landing.useCases.onboarding.title', descKey: 'landing.useCases.onboarding.desc', icon: Rocket },
            { labelKey: 'landing.useCases.discovery.label', titleKey: 'landing.useCases.discovery.title', descKey: 'landing.useCases.discovery.desc', icon: Search },
            { labelKey: 'landing.useCases.sprint.label', titleKey: 'landing.useCases.sprint.title', descKey: 'landing.useCases.sprint.desc', icon: CalendarClock },
            { labelKey: 'landing.useCases.meetings.label', titleKey: 'landing.useCases.meetings.title', descKey: 'landing.useCases.meetings.desc', icon: MessageSquareText },
          ].map((card, i) => (
            <Reveal key={card.labelKey} delay={i * 0.1}>
              <div className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" style={{ borderRadius: 0 }} onClick={() => navigate('/use-cases')}>
                <div className="w-full mb-6 flex items-center justify-center" style={{ aspectRatio: '4/3', background: '#FAF9F5' }}>
                  <card.icon size={48} strokeWidth={1.5} color="#F8485E" />
                </div>
                <Label>{t(card.labelKey)}</Label>
                <h4 className="mb-2" style={{ fontSize: 18, fontWeight: 700, lineHeight: '26px', color: '#141413' }}>{t(card.titleKey)}</h4>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{t(card.descKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────── METRICS ───────── */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '100px 60px' }}>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { value: '+40%', label: t('landing.metrics.productivity') },
              { value: '-70%', label: t('landing.metrics.redundancy') },
              { value: '92%', label: t('landing.metrics.coherence') },
            ].map((m, i) => (
              <Reveal key={m.label} delay={i * 0.15}>
                <div className="text-white" style={{ fontSize: 72, fontWeight: 700, lineHeight: 1 }}>{m.value}</div>
                <p className="text-white/50 mt-4 text-sm font-medium uppercase tracking-widest">{m.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── DIFFERENTIATION ───────── */}
      <Section bg="" className="bg-[#F4F4F4]">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { from: t('landing.diff.1.from'), to: t('landing.diff.1.to') },
            { from: t('landing.diff.2.from'), to: t('landing.diff.2.to') },
            { from: t('landing.diff.3.from'), to: t('landing.diff.3.to') },
          ].map((d, i) => (
            <Reveal key={d.from} delay={i * 0.15}>
              <h3 className="mb-2" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px', color: '#141413' }}>{d.from}</h3>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>→ {d.to}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────── GOVERNANCE ───────── */}
      <Section bg="bg-white" id="security">
        <Reveal className="max-w-2xl">
          <Label>{t('landing.gov.label')}</Label>
          <h2 className="mb-10" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>{t('landing.gov.h2')}</h2>
          <ul className="space-y-6">
            {[t('landing.gov.1'), t('landing.gov.2'), t('landing.gov.3')].map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span className="mt-1 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                <span style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* ───────── FINAL CTA ───────── */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '120px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              {t('landing.cta.h2.1')}<br />{t('landing.cta.h2.2')}
            </h2>
            <p className="text-white/50 mb-10" style={{ fontSize: 16, lineHeight: 1.6 }}>{t('landing.cta.desc')}</p>
            <PrimaryBtn onClick={() => navigate('/demo')}>{t('nav.demo')}</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </div>
  );
};

export default Landing;
