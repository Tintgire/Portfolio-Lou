'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm() {
  const t = useTranslations('Contact');
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    setStatus(res.ok ? 'success' : 'error');
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-6">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <label className="grid gap-2">
        <span className="text-meta">{t('name')}</span>
        <input
          name="name"
          required
          className="border-cream/30 focus:border-signal border-b bg-transparent py-2 outline-none"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-meta">{t('email')}</span>
        <input
          type="email"
          name="email"
          required
          className="border-cream/30 focus:border-signal border-b bg-transparent py-2 outline-none"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-meta">{t('message')}</span>
        <textarea
          name="message"
          required
          rows={6}
          className="border-cream/30 focus:border-signal resize-none border-b bg-transparent py-2 outline-none"
        />
      </label>
      <button
        type="submit"
        disabled={status === 'sending'}
        className="text-brutal hover:text-signal text-left text-3xl transition-colors disabled:opacity-50"
      >
        {t('send')} →
      </button>
      {status === 'success' && <p className="text-acid text-meta">{t('success')}</p>}
      {status === 'error' && <p className="text-signal text-meta">{t('error')}</p>}
    </form>
  );
}
