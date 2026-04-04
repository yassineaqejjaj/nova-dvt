import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';

const agents = [
  { role: 'Product Manager', desc: 'structuring vision, backlog, priorities' },
  { role: 'Designer', desc: 'UX thinking, flows, interfaces' },
  { role: 'Developer', desc: 'technical architecture, specs, constraints' },
  { role: 'QA', desc: 'validation, edge cases, quality checks' },
  { role: 'Data / Strategy', desc: 'insights, metrics, decision support' },
];

const traits = ['its own objective', 'its own reasoning style', 'access to the same shared context'];

const collab = [
  'build on each other's outputs',
  'challenge inconsistencies',
  'refine results step by step',
];

const critiqueResult = ['higher quality', 'fewer blind spots', 'more reliable decisions'];

const Agents: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* Hero */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>Agents</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              A team, not a tool
            </h1>
            <p className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}>
              Nova is built around one idea:<br />
              AI should behave like a team.<br /><br />
              Not one assistant.<br />
              A set of specialized agents, each with a role.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Role-based intelligence */}
      <Section bg="bg-white">
        <Reveal className="mb-16">
          <Label>ROLE-BASED INTELLIGENCE</Label>
          <h2 style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Each agent represents a real function
          </h2>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {agents.map((a, i) => (
            <Reveal key={a.role} delay={i * 0.1}>
              <div className="p-6" style={{ background: '#FAF9F5' }}>
                <h3 className="mb-2" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px', color: '#141413' }}>{a.role}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6 }}>{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <h3 className="mb-4" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px', color: '#141413' }}>Each agent has:</h3>
          <ul className="space-y-3">
            {traits.map((t) => (
              <li key={t} className="flex items-start gap-4">
                <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                <span style={{ fontSize: 16, lineHeight: 1.6 }}>{t}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Section>

      {/* Collaboration by design */}
      <section style={{ background: '#3C3C3A' }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px' }}>
          <Reveal>
            <Label>COLLABORATION BY DESIGN</Label>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Agents don't work alone.
            </h2>
            <p className="text-white/60 mb-8" style={{ fontSize: 16, lineHeight: 1.6 }}>They:</p>
            <ul className="space-y-4 mb-12">
              {collab.map((c) => (
                <li key={c} className="flex items-start gap-4 text-white/80">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span style={{ fontSize: 16, lineHeight: 1.6 }}>{c}</span>
                </li>
              ))}
            </ul>
            <p className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6 }}>
              You move from a single answer<br />to a structured conversation between experts.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Built-in critique */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal className="max-w-2xl">
          <Label>BUILT-IN CRITIQUE</Label>
          <h2 className="mb-8" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', color: '#141413' }}>
            Every output can be reviewed by another agent.
          </h2>
          <div className="space-y-6 mb-12" style={{ fontSize: 16, lineHeight: 1.6 }}>
            <p style={{ fontWeight: 700, color: '#141413' }}>Example:</p>
            <ul className="space-y-3">
              {['PM writes a feature', 'QA challenges edge cases', 'Dev validates feasibility'].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontWeight: 700, color: '#141413' }}>This creates:</p>
            <ul className="space-y-3">
              {critiqueResult.map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <span className="mt-2 w-2 h-2 shrink-0" style={{ background: '#F8485E' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* Your augmented team */}
      <section style={{ background: '#141413' }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '120px 60px' }}>
          <Reveal>
            <h2 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Your augmented team
            </h2>
            <p className="text-white/60 mb-2" style={{ fontSize: 16, lineHeight: 1.6 }}>Nova doesn't replace your team.</p>
            <p className="text-white/60 mb-10" style={{ fontSize: 16, lineHeight: 1.6 }}>
              It extends it.<br />You stay in control.<br />Agents help you think, structure, and deliver faster.
            </p>
            <PrimaryBtn onClick={() => navigate('/demo')}>Book a demo</PrimaryBtn>
          </Reveal>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Agents;
