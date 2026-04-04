import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';

const flows = [
  {
    label: 'DISCOVERY',
    items: ['Research synthesis', 'Personas', 'Problem framing'],
  },
  {
    label: 'PRODUCT DEFINITION',
    items: ['Vision', 'Features', 'KPIs'],
  },
  {
    label: 'DELIVERY',
    items: ['Roadmap', 'Sprint planning', 'User stories'],
  },
  {
    label: 'QA & ITERATION',
    items: ['Validation', 'Feedback loops', 'Continuous improvement'],
  },
];

const Workflows: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* Hero */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>Workflows</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              From chaos to structured execution
            </h1>
            <p className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}>
              Work is rarely linear.<br />But it still needs structure.<br /><br />
              Nova provides guided workflows to turn ideas into outcomes.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Built on how teams really work */}
      <Section bg="bg-white">
        <Reveal className="max-w-2xl mb-16">
          <Label>HOW TEAMS REALLY WORK</Label>
          <h2 className="mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Discover → Define → Develop → Deliver
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.6 }}>No abstraction. Just execution.</p>
        </Reveal>
      </Section>

      {/* End-to-end flows */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal className="mb-16">
          <Label>END-TO-END FLOWS</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Nova supports full workflows
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {flows.map((f, i) => (
            <Reveal key={f.label} delay={i * 0.1}>
              <div className="p-6" style={{ background: '#FFFFFF' }}>
                <Label>{f.label}</Label>
                <ul className="space-y-3 mt-4">
                  {f.items.map((item) => (
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

      {/* Dynamic and adaptable */}
      <section style={{ background: '#3C3C3A' }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px' }}>
          <Reveal>
            <Label>DYNAMIC AND ADAPTABLE</Label>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Workflows are not fixed templates.
            </h2>
            <p className="text-white/60 mb-8" style={{ fontSize: 16, lineHeight: 1.6 }}>They adapt to:</p>
            <ul className="space-y-4 mb-12">
              {['your context', 'your inputs', 'your team structure'].map((item) => (
                <li key={item} className="flex items-start gap-4 text-white/80">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span style={{ fontSize: 16, lineHeight: 1.6 }}>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/60 mb-4" style={{ fontSize: 16, lineHeight: 1.6 }}>Each step uses agents to:</p>
            <div className="flex gap-8">
              {['generate', 'refine', 'validate'].map((word) => (
                <span key={word} className="text-white" style={{ fontSize: 22, fontWeight: 700 }}>{word}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Always moving forward */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '120px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Always moving forward
            </h2>
            <p className="text-white/60 mb-2" style={{ fontSize: 16, lineHeight: 1.6 }}>Nova doesn't just generate content.</p>
            <p className="text-white/60 mb-10" style={{ fontSize: 16, lineHeight: 1.6 }}>
              It pushes the work forward.<br />Each step produces something usable, not just ideas.
            </p>
            <PrimaryBtn onClick={() => navigate('/demo')}>Book a demo</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Workflows;
