import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';

const artefactGroups = [
  {
    label: 'PRODUCT ARTEFACTS',
    items: ['Product vision', 'Discovery canvas', 'Personas', 'Feature lists'],
  },
  {
    label: 'DELIVERY ARTEFACTS',
    items: ['Roadmaps', 'Epics', 'User stories', 'Acceptance criteria'],
  },
  {
    label: 'TECHNICAL ARTEFACTS',
    items: ['Technical specs', 'Architecture drafts', 'API definitions'],
  },
  {
    label: 'DECISION ARTEFACTS',
    items: ['Trade-offs', 'Risks', 'Key decisions'],
  },
];

const Artefacts: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* Hero */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>Artefacts</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              Work that actually exists
            </h1>
            <p className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}>
              Nova is built around outputs.<br />
              Not conversations. Real deliverables.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Structured by default */}
      <Section bg="bg-white">
        <Reveal className="max-w-2xl">
          <Label>STRUCTURED BY DEFAULT</Label>
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Every artefact is clear, organized, and ready to use.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>
            No messy notes. No lost information.
          </p>
        </Reveal>
      </Section>

      {/* Types of artefacts */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal className="mb-16">
          <Label>TYPES OF ARTEFACTS</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Nova generates and maintains
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {artefactGroups.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.1}>
              <div className="p-6" style={{ background: '#FFFFFF' }}>
                <Label>{g.label}</Label>
                <ul className="space-y-3 mt-4">
                  {g.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 w-1.5 h-1.5 shrink-0" style={{ background: '#F8485E' }} />
                      <span style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Connected to context */}
      <section style={{ background: '#3C3C3A' }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px' }}>
          <Reveal>
            <Label>CONNECTED TO CONTEXT</Label>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Full traceability, built in.
            </h2>
            <p className="text-white/60 mb-8" style={{ fontSize: 16, lineHeight: 1.6 }}>Each artefact is linked to:</p>
            <ul className="space-y-4 mb-12">
              {['its origin (inputs, documents)', 'the reasoning behind it', 'the agents that contributed'].map((item) => (
                <li key={item} className="flex items-start gap-4 text-white/80">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
            <div className="grid sm:grid-cols-3 gap-8">
              {['full traceability', 'easier updates', 'better alignment'].map((r) => (
                <div key={r}>
                  <div className="text-white" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>{r}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Living documents */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal className="max-w-2xl">
          <Label>LIVING DOCUMENTS</Label>
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Artefacts are not static.
          </h2>
          <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6 }}>They evolve with the project.</p>
          <ul className="space-y-3">
            {['Updated automatically', 'Refined by agents', 'Improved over time'].map((item) => (
              <li key={item} className="flex items-start gap-4">
                <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                <span style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* From output to impact */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '120px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              From output to impact
            </h2>
            <p className="text-white/60 mb-2" style={{ fontSize: 16, lineHeight: 1.6 }}>
              Everything produced is actionable, aligned, and ready for execution.
            </p>
            <p className="text-white/60 mb-10" style={{ fontSize: 16, lineHeight: 1.6 }}>
              You don't just generate content. You build momentum.
            </p>
            <PrimaryBtn onClick={() => navigate('/demo')}>Book a demo</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Artefacts;
