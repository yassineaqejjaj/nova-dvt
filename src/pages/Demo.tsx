import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section, Reveal, Label, PrimaryBtn, LandingHeader, LandingFooter } from './Landing';
import { toast } from '@/hooks/use-toast';

const Demo: React.FC = () => {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;

    setSending(true);
    try {
      const mailtoLink = `mailto:Nova@devoteam.com?subject=${encodeURIComponent(
        `Demo request from ${form.name} – ${form.company || 'N/A'}`
      )}&body=${encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nCompany: ${form.company}\nRole: ${form.role}\n\nMessage:\n${form.message}`
      )}`;
      window.open(mailtoLink, '_blank');
      setSent(true);
      toast({ title: 'Request prepared', description: 'Your email client should open with the demo request.' });
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif', color: '#3C3C3A' }}>
      <LandingHeader onDemo={() => {}} />

      {/* ─── Hero ─── */}
      <section style={{ background: '#141413', paddingTop: 72 }}>
        <div className="mx-auto text-center" style={{ maxWidth: 1200, padding: '100px 60px 60px' }}>
          <Reveal>
            <Label>GET STARTED</Label>
            <h1 className="text-white mb-6" style={{ fontSize: 43, fontWeight: 700, lineHeight: '54px' }}>
              Book a demo
            </h1>
            <p className="text-white/60 mx-auto" style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 480 }}>
              See how Nova can transform your team's workflow. Fill in the form and we'll get back to you.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ─── Form ─── */}
      <Section bg="bg-white">
        <div className="max-w-lg mx-auto">
          {sent ? (
            <Reveal className="text-center">
              <div className="mb-6" style={{ fontSize: 48 }}>✓</div>
              <h2 className="mb-4" style={{ fontSize: 22, fontWeight: 700, color: '#141413' }}>
                Thank you!
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.6 }}>
                Your demo request has been prepared. Check your email client to send it to our team.
              </p>
              <div className="mt-8">
                <PrimaryBtn onClick={() => navigate('/')}>Back to home</PrimaryBtn>
              </div>
            </Reveal>
          ) : (
            <Reveal>
              <form onSubmit={handleSubmit} className="space-y-6">
                {[
                  { name: 'name', label: 'Full name *', type: 'text', required: true },
                  { name: 'email', label: 'Work email *', type: 'email', required: true },
                  { name: 'company', label: 'Company', type: 'text', required: false },
                  { name: 'role', label: 'Your role', type: 'text', required: false },
                ].map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="block mb-2"
                      style={{ fontSize: 13, fontWeight: 700, color: '#3C3C3A', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                      {field.label}
                    </label>
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      required={field.required}
                      value={(form as any)[field.name]}
                      onChange={handleChange}
                      maxLength={200}
                      className="w-full px-4 py-3 border outline-none transition-colors focus:border-[#F8485E]"
                      style={{ borderColor: '#E0E0E0', borderRadius: 0, fontSize: 16, fontFamily: 'Montserrat, sans-serif' }}
                    />
                  </div>
                ))}
                <div>
                  <label
                    htmlFor="message"
                    className="block mb-2"
                    style={{ fontSize: 13, fontWeight: 700, color: '#3C3C3A', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    maxLength={1000}
                    className="w-full px-4 py-3 border outline-none transition-colors focus:border-[#F8485E] resize-none"
                    style={{ borderColor: '#E0E0E0', borderRadius: 0, fontSize: 16, fontFamily: 'Montserrat, sans-serif' }}
                  />
                </div>
                <PrimaryBtn type="submit" disabled={sending}>
                  {sending ? 'Sending…' : 'Send request'}
                </PrimaryBtn>
              </form>
            </Reveal>
          )}
        </div>
      </Section>

      <LandingFooter />
    </div>
  );
};

export default Demo;
