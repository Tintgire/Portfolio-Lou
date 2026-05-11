import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { POST } from './route';

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendMock.mockReset();
    process.env.RESEND_API_KEY = 'test_key';
    process.env.CONTACT_EMAIL_TO = 'lou@example.com';
  });

  it('rejects invalid payload with 400', async () => {
    const res = await POST(makeRequest({ name: '' }));
    expect(res.status).toBe(400);
  });

  it('rejects honeypot-filled submissions silently with 200', async () => {
    const res = await POST(
      makeRequest({
        name: 'Bot',
        email: 'b@b.com',
        message: 'spam',
        website: 'http://spam.com',
      }),
    );
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends email via Resend on valid submission', async () => {
    sendMock.mockResolvedValue({ data: { id: 'abc' }, error: null });
    const res = await POST(
      makeRequest({
        name: 'Alice',
        email: 'a@a.com',
        message: 'Hello',
        website: '',
      }),
    );
    expect(res.status).toBe(200);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0]?.[0]).toMatchObject({ to: 'lou@example.com' });
  });
});
