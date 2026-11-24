/** The chat is switched on only when both private settings are present in Vercel. */
export const chatEnabled = () =>
  Boolean(process.env.PARLEY_API_KEY && process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
