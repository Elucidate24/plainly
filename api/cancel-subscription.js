// api/cancel-subscription.js
// Vercel serverless function — cancels a Lemon Squeezy subscription
// Environment variables needed:
//   LEMONSQUEEZY_API_KEY
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('lemonsqueezy_subscription_id')
      .eq('id', user_id)
      .single();

    if (error || !profile?.lemonsqueezy_subscription_id) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const cancelRes = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${profile.lemonsqueezy_subscription_id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
      }
    );

    if (!cancelRes.ok && cancelRes.status !== 404) {
      const err = await cancelRes.json().catch(() => ({}));
      throw new Error(err.errors?.[0]?.detail || 'Cancellation failed');
    }

    await supabase
      .from('profiles')
      .update({ is_pro: false, lemonsqueezy_subscription_id: null })
      .eq('id', user_id);

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
