import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthDialog } from '@/components/AuthDialog';
import { motion, useInView } from 'framer-motion';
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

export const LandingHeader: React.FC<{ onDemo: () => void }> = ({ onDemo }) => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

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
            { label: 'Vision', path: '/vision' },
            { label: 'Product', path: '/product' },
            { label: 'Use Cases', path: '/use-cases' },
            { label: 'Security', path: '/#security' },
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
          <PrimaryBtn onClick={onDemo}>Book a demo</PrimaryBtn>
        </nav>
      </div>
    </header>
  );
};

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  return (
    <footer style={{ background: '#141413', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="mx-auto" style={{ maxWidth: 1200, padding: '60px 60px 40px' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {[
            { title: 'Nova', links: [{ label: 'Overview', path: '/' }, { label: 'Features', path: '/product' }] },
            { title: 'Product', links: [{ label: 'Agents', path: '/product' }, { label: 'Workflows', path: '/product' }, { label: 'Artefacts', path: '/product' }] },
            { title: 'AI Factory', links: [{ label: 'Vision', path: '/vision' }, { label: 'Use Cases', path: '/use-cases' }] },
            { title: 'Devoteam', links: [{ label: 'About', path: '/' }, { label: 'Contact', path: '/demo' }] },
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

  const openAuth = (tab: 'signin' | 'signup') => {
    setAuthTab(tab);
    setShowAuth(true);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ───────── HERO ───────── */}
      <section
        className="relative min-h-screen flex items-end overflow-hidden"
        style={{ background: '#141413' }}
      >
        <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
        <div className="relative z-10 mx-auto w-full" style={{ maxWidth: 1200, padding: '0 60px 80px' }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <Label>Devoteam AI Factory</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Nova is not just an assistant.<br />
              It is the operating system for augmented teams.
            </h1>
            <p className="text-white/70 mb-10" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 520 }}>
              Product, Design, Engineering and AI agents working in one system.
            </p>
            <div className="flex flex-wrap gap-4 mb-16">
              <PrimaryBtn onClick={() => navigate('/vision')}>Discover Nova</PrimaryBtn>
              <SecondaryBtn onClick={() => navigate('/demo')}>Book a demo</SecondaryBtn>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex gap-10 border-t border-white/10 pt-8"
          >
            {['Context-aware', 'Agent-driven', 'Built for delivery'].map((f) => (
              <span key={f} className="text-white/50 text-sm font-medium tracking-wide">{f}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ───────── MANIFEST ───────── */}
      <Section bg="bg-white">
        <Reveal className="text-center max-w-3xl mx-auto">
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }} className="mb-6">
            Teams do not need more tools.<br />They need more coherence.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>
            Nova connects context, workflows and AI into one experience.
          </p>
        </Reveal>
      </Section>

      {/* ───────── VALUE BLOCKS ───────── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { label: 'CONTEXT', title: 'Context becomes active', text: 'Nova understands projects, history, documents and decisions.' },
            { label: 'AGENTS', title: 'AI becomes structured', text: 'Product, Design, Dev and QA roles activated dynamically.' },
            { label: 'FLOW', title: 'Work becomes continuous', text: 'From idea to delivery without losing context.' },
          ].map((block, i) => (
            <Reveal key={block.label} delay={i * 0.15}>
              <Label>{block.label}</Label>
              <h3 className="mb-4" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px', color: '#141413' }}>{block.title}</h3>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{block.text}</p>
              <TertiaryLink onClick={() => navigate('/product')}>See how it works</TertiaryLink>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────── PRODUCT IMMERSIVE ───────── */}
      <section id="product" style={{ background: '#3C3C3A' }}>
        <div className="mx-auto grid md:grid-cols-2 gap-12 items-center" style={{ maxWidth: 1200, padding: '100px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              One system.<br />Multiple forms of intelligence.
            </h2>
            <p className="text-white/60 mb-8" style={{ fontSize: 16, lineHeight: 1.6 }}>
              Nova combines context, workflows, artefacts and agents in one workspace.
            </p>
            <PrimaryBtn onClick={() => navigate('/product')}>Explore the product</PrimaryBtn>
          </Reveal>
          <Reveal delay={0.2}>
            <img src={productMockup} alt="Nova workspace" className="w-full shadow-2xl" loading="lazy" width={1200} height={800} style={{ borderRadius: 0 }} />
          </Reveal>
        </div>
      </section>

      {/* ───────── USE CASES ───────── */}
      <Section bg="bg-white" id="use-cases-preview">
        <Reveal className="mb-16">
          <Label>USE CASES</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>Built for how teams actually work</h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'ONBOARDING', title: 'Mission onboarding', desc: 'Get a new team member up to speed in minutes, not weeks.' },
            { label: 'DISCOVERY', title: 'Feature discovery', desc: 'From user need to validated feature with full traceability.' },
            { label: 'SPRINT', title: 'Sprint planning', desc: 'Real capacity data, not optimistic guesses.' },
            { label: 'MEETINGS', title: 'Meeting to action', desc: 'Turn any meeting into structured decisions and artefacts.' },
          ].map((card, i) => (
            <Reveal key={card.label} delay={i * 0.1}>
              <div className="bg-white p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer" style={{ borderRadius: 0 }} onClick={() => navigate('/use-cases')}>
                <div className="w-full mb-4" style={{ aspectRatio: '4/3', background: '#F4F4F4' }} />
                <Label>{card.label}</Label>
                <h4 className="mb-2" style={{ fontSize: 18, fontWeight: 700, lineHeight: '26px', color: '#141413' }}>{card.title}</h4>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>{card.desc}</p>
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
              { value: '+40%', label: 'productivity' },
              { value: '-70%', label: 'redundancy' },
              { value: '92%', label: 'coherence' },
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
            { from: 'Not a chatbot', to: 'builds outputs' },
            { from: 'Not a copilot', to: 'collaborates' },
            { from: 'Not a tool', to: 'becomes your system' },
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
          <Label>GOVERNANCE</Label>
          <h2 className="mb-10" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>Built with governance in mind</h2>
          <ul className="space-y-6">
            {['Human validation at every critical step', 'Traceable artefacts linked to context and decisions', 'Controlled context with granular access'].map((item) => (
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
              From AI-aware teams<br />to AI-native organizations.
            </h2>
            <p className="text-white/50 mb-10" style={{ fontSize: 16, lineHeight: 1.6 }}>Nova is the layer in between.</p>
            <PrimaryBtn onClick={() => navigate('/demo')}>Book a demo</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} defaultTab={authTab} />
    </div>
  );
};

export default Landing;
