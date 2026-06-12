'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [status, setStatus] = useState({ loading: false, error: '', done: false });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setStatus({ loading: true, error: '', done: false });
    try {
      if (!form.name || !form.phone || !form.message) throw new Error('Name, phone and message are required.');
      await api('/contact', { method: 'POST', body: form });
      setStatus({ loading: false, error: '', done: true });
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e) {
      setStatus({ loading: false, error: e.message, done: false });
    }
  };

  if (status.done) {
    return (
      <div className="mt-6 rounded-xl bg-emerald-50 p-6 text-center">
        <p className="font-display font-bold text-emerald-700">Thanks! Your enquiry has been received.</p>
        <p className="mt-1 text-sm text-emerald-600">Our team will get back to you shortly.</p>
        <button className="btn-ghost mt-4" onClick={() => setStatus({ loading: false, error: '', done: false })}>Send another</button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name *</label>
          <input className="input" value={form.name} onChange={set('name')} placeholder="Your name" />
        </div>
        <div>
          <label className="label">Phone *</label>
          <input className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98xxxxxx" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" value={form.subject} onChange={set('subject')} placeholder="Booking enquiry" />
        </div>
      </div>
      <div>
        <label className="label">Message *</label>
        <textarea className="input min-h-[120px]" value={form.message} onChange={set('message')} placeholder="Tell us about your trip…" />
      </div>
      {status.error && <p className="text-sm font-semibold text-red-600">{status.error}</p>}
      <button className="btn-primary justify-center" onClick={submit} disabled={status.loading}>
        {status.loading ? 'Sending…' : 'Send enquiry'}
      </button>
    </div>
  );
}
