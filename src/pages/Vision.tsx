import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';

const Vision: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ─── Hero ─── */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>Vision</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              Vision of Nova
            </h1>
            <p className="text-white/50 mb-2" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>
              Nova: Not Only a Virtual Assistant
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── A simple shift ─── */}
      <Section bg="bg-white">
        <Reveal className="max-w-2xl">
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            A simple shift
          </h2>
          <div className="space-y-6" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <p>Most AI tools today are isolated.<br />One assistant. One prompt. One answer.</p>
            <p>But real work doesn't happen like that.</p>
            <p>Work is collaborative.<br />It depends on context.<br />It evolves over time.</p>
            <p style={{ fontWeight: 700, color: '#141413' }}>Nova was built to match that reality.</p>
          </div>
        </Reveal>
      </Section>

      {/* ─── Our vision ─── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal className="max-w-2xl">
          <Label>OUR VISION</Label>
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Build the first system that organizes work between humans and AI.
          </h2>
          <div className="space-y-6" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <p>Not another tool.<br />A system that structures, orchestrates, and accelerates.</p>
            <p style={{ fontWeight: 700, color: '#141413' }}>Nova acts like a Work OS:</p>
            <ul className="space-y-4">
              {[
                'It understands the full context of a mission or product',
                'It coordinates multiple specialized agents',
                'It produces consistent, traceable, and usable outputs',
              ].map((item) => (
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
          <Label>WHY NOVA EXISTS</Label>
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Companies face a simple problem
          </h2>
          <div className="space-y-6" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <p>Too much information.<br />Not enough structure.<br />And AI that is still disconnected from real workflows.</p>
            <p style={{ fontWeight: 700, color: '#141413' }}>Existing solutions:</p>
            <ul className="space-y-3">
              {[
                "don't retain context",
                "don't collaborate with each other",
                "don't make reasoning visible",
              ].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontWeight: 700, color: '#141413' }}>Nova was designed to fix this.</p>
            <p>A system able to:</p>
            <ul className="space-y-3">
              {[
                'coordinate multiple agents reliably',
                'maintain a dynamic project memory',
                'make decisions explainable',
              ].map((item) => (
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
            <Label>WHAT NOVA CHANGES</Label>
            <h2 className="text-white mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              You don't work alone with AI.<br />You work with an augmented team.
            </h2>
            <p className="text-white/60 mb-8" style={{ fontSize: 16, lineHeight: 1.6 }}>
              A Product Manager, a Designer, a Developer…<br />
              each supported by specialized agents that can:
            </p>
            <ul className="space-y-4 mb-12">
              {['understand full context', 'collaborate with each other', 'continuously improve output quality'].map((item) => (
                <li key={item} className="flex items-start gap-4 text-white/80">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { metric: 'More', label: 'consistency' },
                { metric: 'Less', label: 'information loss' },
                { metric: 'Real', label: 'acceleration in delivery' },
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
            <Label>OUR AMBITION</Label>
            <h2 className="text-white mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Turn AI into a work system, not a feature.
            </h2>
            <div className="max-w-xl mx-auto space-y-4 mb-12">
              {[
                'where decisions are traceable',
                'where human + AI collaboration is seamless',
                "where productivity doesn't come at the cost of quality",
              ].map((item) => (
                <p key={item} className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</p>
              ))}
            </div>
            <p className="text-white mb-2" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>
              Nova is not an assistant.
            </p>
            <p className="text-white/50 mb-10" style={{ fontSize: 16, lineHeight: 1.6 }}>
              It's the layer that changes how teams think, decide, and build.
            </p>
            <PrimaryBtn onClick={() => navigate('/demo')}>Book a demo</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Vision;
