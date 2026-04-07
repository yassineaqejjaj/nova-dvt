import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';
import { Diamond, Search, Lightbulb, PenTool, Rocket, ArrowRight } from 'lucide-react';

const UseCases: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => navigate('/demo')} />

      {/* ─── Hero ─── */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: '100px 60px 80px' }}>
          <Reveal>
            <Label>Methodology</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px', maxWidth: 700 }}>
              The Double Diamond,<br />powered by AI
            </h1>
            <p className="text-white/60" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}>
              Nova follows the Double Diamond framework — the proven design methodology — and supercharges every phase with AI agents.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Double Diamond Visual ─── */}
      <Section bg="" className="bg-white">
        <Reveal>
          <div className="text-center mb-16">
            <Label>How it works</Label>
            <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>
              From problem to solution, structured and traceable
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A', maxWidth: 600, margin: '0 auto' }}>
              The Double Diamond splits every initiative into four phases: two divergent, two convergent. Nova maps its tools, agents, and workflows to each.
            </p>
          </div>

          {/* Diamond diagram */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-6">
            {[
              { label: 'Discover', icon: Search, color: '#6366F1', desc: 'Diverge' },
              { label: 'Define', icon: Lightbulb, color: '#F8485E', desc: 'Converge' },
              { label: 'Develop', icon: PenTool, color: '#6366F1', desc: 'Diverge' },
              { label: 'Deliver', icon: Rocket, color: '#F8485E', desc: 'Converge' },
            ].map((phase, i) => (
              <div key={phase.label} className="relative flex flex-col items-center">
                {/* Diamond shape */}
                <div
                  className="w-20 h-20 flex items-center justify-center rotate-45 mb-4"
                  style={{ background: phase.color }}
                >
                  <phase.icon size={28} strokeWidth={1.5} className="-rotate-45 text-white" />
                </div>
                <span className="text-xs uppercase tracking-[0.15em] font-bold mb-1" style={{ color: phase.color }}>
                  {phase.desc}
                </span>
                <span className="font-bold text-lg" style={{ color: '#141413' }}>{phase.label}</span>
                {i < 3 && (
                  <ArrowRight
                    size={16}
                    className="absolute right-0 top-8 hidden md:block"
                    style={{ color: '#D1D1D1', transform: 'translateX(50%)' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#6366F1' }} />
              <span className="text-sm" style={{ color: '#3C3C3A' }}>Diamond 1 — Problem space</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: '#F8485E' }} />
              <span className="text-sm" style={{ color: '#3C3C3A' }}>Diamond 2 — Solution space</span>
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
                <Label>Phase 1 — Discover</Label>
              </div>
              <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>
                Explore the problem space
              </h2>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>
                Diverge. Gather signals, understand users, challenge assumptions. Nova helps you cast a wide net without losing structure.
              </p>
            </div>
            <div>
              <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                NOVA TOOLS
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Smart Discovery Canvas — AI-guided problem framing',
                  'User Research workflows — objectives, plans, synthesis',
                  'Market Research — competitive & trend analysis',
                  'User Persona Builder — data-driven persona creation',
                  'Meeting Minutes — extract insights from any meeting',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 shrink-0 rounded-full" style={{ background: '#6366F1' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>
                → From scattered inputs to structured understanding.
              </p>
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
                <Label>Phase 2 — Define</Label>
              </div>
              <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>
                Frame the right problem
              </h2>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>
                Converge. Synthesize findings into a clear problem statement, vision, and priorities. Nova helps you align before you build.
              </p>
            </div>
            <div>
              <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#F8485E', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                NOVA TOOLS
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Product Vision Definer — mission, audience, value prop',
                  'Instant PRD — structured product requirements in minutes',
                  'KPI Generator — measurable outcomes tied to objectives',
                  'Insight Synthesizer — patterns from research data',
                  'Product Context — persistent strategic alignment',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 shrink-0 rounded-full" style={{ background: '#F8485E' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>
                → From broad research to focused direction.
              </p>
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
                <Label>Phase 3 — Develop</Label>
              </div>
              <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>
                Explore solutions
              </h2>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>
                Diverge again. Generate ideas, prototype approaches, challenge with multiple perspectives. Nova's agents debate so your team doesn't have to guess.
              </p>
            </div>
            <div>
              <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                NOVA TOOLS
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Multi-Agent Chat — PM, UX, Dev, QA debate solutions',
                  'Epic to User Stories — break features into deliverables',
                  'Canvas Generator — Lean, Business Model, Value Prop',
                  'Estimation Tool — T-shirt sizing with rationale',
                  'RACI Generator — role clarity before execution',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 shrink-0 rounded-full" style={{ background: '#6366F1' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>
                → From one idea to validated, multi-perspective solutions.
              </p>
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
                <Label>Phase 4 — Deliver</Label>
              </div>
              <h2 className="mb-4" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>
                Ship with confidence
              </h2>
              <p className="mb-6" style={{ fontSize: 16, lineHeight: 1.6, color: '#3C3C3A' }}>
                Converge. Finalize specs, plan sprints, generate test cases, and produce release-ready artefacts. Everything is linked and traceable.
              </p>
            </div>
            <div>
              <p className="mb-4" style={{ fontSize: 13, fontWeight: 700, color: '#F8485E', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                NOVA TOOLS
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Technical Specifications — architecture & API docs',
                  'Test Case Generator — edge cases & acceptance criteria',
                  'Sprint Intelligence — capacity-based planning',
                  'Release Notes Generator — changelog from artefacts',
                  'Impact Analysis — trace changes across the system',
                ].map((b) => (
                  <li key={b} className="flex items-start gap-4">
                    <span className="mt-2 w-2 h-2 shrink-0 rounded-full" style={{ background: '#F8485E' }} />
                    <span style={{ fontSize: 16, lineHeight: 1.6 }}>{b}</span>
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, color: '#141413' }}>
                → From validated solution to production-ready delivery.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ─── Why it matters ─── */}
      <Section bg="" className="bg-[#FAF9F5]">
        <Reveal>
          <div className="text-center mb-12">
            <Label>Why it matters</Label>
            <h2 className="mb-6" style={{ fontSize: 34, fontWeight: 700, lineHeight: '44px', color: '#141413' }}>
              Structure without bureaucracy
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: 'Full traceability',
                desc: 'Every artefact links back to its origin — research, decision, agent contribution. No more "where did this come from?"',
              },
              {
                title: 'Right tool, right phase',
                desc: 'Nova surfaces the relevant tools for each phase. No overwhelm, no guessing what to do next.',
              },
              {
                title: 'AI that follows methodology',
                desc: 'Unlike generic AI, Nova\'s agents understand which phase you\'re in and adapt their behavior accordingly.',
              },
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
            <h2 className="text-white mb-4" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Nova doesn't replace your process.
            </h2>
            <p className="text-white/50 mb-10" style={{ fontSize: 22, fontWeight: 700, lineHeight: '32px' }}>
              It makes it AI-native.
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
