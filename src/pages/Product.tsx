import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, TertiaryLink, LandingHeader, LandingFooter } from './Landing';
import productMockup from '@/assets/product-mockup.jpg';

const Product: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ─── Hero ─── */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>Product</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              Nova: Not Only a Virtual Assistant
            </h1>
            <p className="text-white/60 mb-4" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}>
              Nova is a Work OS powered by AI agents.<br />
              It doesn't just answer questions.<br />
              It structures how work gets done.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <Section bg="bg-white">
        <Reveal className="mb-16">
          <Label>HOW IT WORKS</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Built on three core layers
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              num: '1',
              label: 'CONTEXT',
              title: 'Everything starts with context',
              bullets: ['Mission context', 'Product context', 'Documents, decisions, history'],
              footer: 'Nova keeps a dynamic memory of your work so nothing gets lost.',
            },
            {
              num: '2',
              label: 'AGENTS',
              title: 'Each role can be augmented',
              bullets: ['Product Manager agent', 'Designer agent', 'Developer agent', 'QA / Data / Strategy agents'],
              footer: "They don't work in isolation. They collaborate, challenge each other, and improve outputs.",
            },
            {
              num: '3',
              label: 'WORKFLOWS',
              title: 'Structured execution',
              bullets: ['Discovery', 'Product definition', 'Delivery', 'QA and iteration'],
              footer: 'Each workflow produces real artefacts: PRDs, user stories, roadmaps, technical specs.',
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
            <Label>WHAT MAKES NOVA DIFFERENT</Label>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Most AI tools are assistants.<br />Nova is a system.
            </h2>
            <ul className="space-y-4">
              {[
                'Multi-agent coordination (not a single model)',
                'Persistent context across time',
                'Traceable reasoning and decisions',
                'Built for real product teams',
              ].map((item) => (
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
          <Label>WHAT YOU GET</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Nova turns scattered work into structured execution.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            'Faster onboarding on any project',
            'Structured and consistent deliverables',
            'Reduced cognitive load',
            'Higher quality decisions',
          ].map((item, i) => (
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
              Ready to see Nova in action?
            </h2>
            <PrimaryBtn onClick={() => navigate('/demo')}>Book a demo</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Product;
