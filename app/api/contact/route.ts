import { Resend } from 'resend';
import { z } from 'zod';

const Schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  website: z.string().optional(),
});

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function checkRate(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count++;
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRate(ip)) return new Response('Too many requests', { status: 429 });

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return new Response('Invalid payload', { status: 400 });

  // Honeypot — silently succeed without sending
  if (parsed.data.website && parsed.data.website.length > 0) {
    return new Response(null, { status: 200 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  if (!apiKey || !to) return new Response('Server misconfigured', { status: 500 });

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: 'noreply@loustudio.fr',
    to,
    replyTo: parsed.data.email,
    subject: `[loustudio.fr] Message de ${parsed.data.name}`,
    text: `${parsed.data.message}\n\n— ${parsed.data.name} <${parsed.data.email}>`,
  });
  if (error) return new Response('Send failed', { status: 502 });
  return new Response(null, { status: 200 });
}
