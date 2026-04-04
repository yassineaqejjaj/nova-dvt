import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';

const useCases = [
  {
    label: 'ONBOARDING',
    title: 'Mission onboarding',
    problem: 'Joining a project means reading dozens of documents with no clear structure.',
    bullets: [
      'Ingest all project materials',
      'Generate a structured brief',
      'Identify key decisions and risks',
      'Propose a 30-60-90 day plan',
    ],
    result: 'From weeks to hours to get full context.',
  },
  {
    label: 'DISCOVERY',
    title: 'Product discovery',
    problem: 'Discovery is slow, fragmented, and hard to structure.',
    bullets: [
      'Generate a Smart Discovery Canvas',
      'Synthesize user insights',
      'Build personas and problem statements',
      'Identify opportunities',
    ],
    result: 'Faster understanding, better framing.',
  },
  {
    label: 'DEFINITION',
    title: 'Product definition',
    problem: 'Turning ideas into structured product direction is inconsistent.',
    bullets: [
      'Define product vision',
      'Structure features and priorities',
      'Generate KPIs',
      'Align stakeholders',
    ],
    result: 'Clear direction, less ambiguity.',
  },
  {
    label: 'DELIVERY',
    title: 'Delivery acceleration',
    problem: 'Writing specs and user stories is time-consuming and uneven.',
    bullets: [
      'Transform epics into user stories',
      'Generate acceptance criteria',
      'Produce technical specifications',
      'Support sprint planning',
    ],
    result: 'Faster, cleaner delivery cycles.',
  },
  {
    label: 'COLLABORATION',
    title: 'Augmented team collaboration',
    problem: 'Teams lose time aligning, reviewing, and correcting work.',
    bullets: [
      'Agents collaborate and review outputs',
      'Built-in critique and validation loops',
      'Continuous improvement of artefacts',
    ],
    result: 'Better quality with less friction.',
  },
  {
    label: 'AI-NATIVE',
    title: 'AI-native way of working',
    problem: 'Teams use AI, but not as a system.',
    bullets: [
      'Define → Assemble → Co-pilot',
      'Build your own agent setup',
      'Operate as an augmented product team',
    ],
    result: 'From AI usage to AI-native execution.',
  },
];

const UseCases: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ─── Hero ─── */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>Use Cases</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              Built for how teams actually work
            </h1>
            <p className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 520 }}>
              Six real scenarios where Nova transforms your team's productivity.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      {useCases.map((uc, i) => {
        const isOdd = i % 2 !== 0;
        const bg = isOdd ? 'bg-[#FAF9F5]' : 'bg-white';
        return (
          <Section key={uc.label} bg="" className={bg}>
            <Reveal>
              <div className="grid md:grid-cols-2 gap-16 items-start">
                <div>
                  <Label>{uc.label}</Label>
                  <h2 className="mb-4" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
                    {uc.title}
                  </h2>
                  <p className="mb-8" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>
                    <strong style={{ color: '#141413' }}>Problem:</strong> {uc.problem}
                  </p>
                </div>
                <div>
                  <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#F8485E', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                    WITH NOVA
                  </p>
                  <ul className="space-y-3 mb-8">
                    {uc.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-4">
                        <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                        <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>
                    → {uc.result}
                  </p>
                </div>
              </div>
            </Reveal>
          </Section>
        );
      })}

      {/* ─── Bottom line ─── */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '120px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-4" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Nova is not a feature.
            </h2>
            <p className="text-white/50 mb-10" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>
              It's how modern teams operate.
            </p>
            <PrimaryBtn onClick={() => navigate('/demo')}>Book a demo</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default UseCases;
