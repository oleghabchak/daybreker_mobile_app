export async function withRetry<T>(fn: () => Promise<T>, opts?: { retries?: number; baseDelayMs?: number }) {
  const retries = opts?.retries ?? 3;
  const base = opts?.baseDelayMs ?? 300;
  let lastErr: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message || '');
      const isRateLimited = /429|rate limit/i.test(msg);
      const isServer = /5\d\d/.test(msg);
      if (i === retries || (!isRateLimited && !isServer)) break;
      const delay = base * Math.pow(2, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
