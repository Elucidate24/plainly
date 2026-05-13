// api/lemonsqueezy-webhook.js
// Vercel serverless function to handle Lemon Squeezy subscription webhooks
// Environment variables needed:
//   LEMONSQUEEZY_WEBHOOK_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_KEY

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function verifySignature(rawBody, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return hash === signature;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signature = req.headers['x-signature'];
    const rawBody = JSON.stringify(req.body);

    if (!verifySignature(rawBody, signature, process.env.LEMONSQUEEZY_WEBHOOK_SECRET)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const eventName = req.body.meta?.event_name;
    const data = req.body.data;
    const userEmail = data?.attributes?.user_email;
    const subscriptionId = data?.id;
    const status = data?.attributes?.status;

    if (!userEmail) {
      return res.status(200).json({ received: true });
    }

    // Find user by email
    const { data: authUser } = await supabase.auth.admin.listUsers();
    const user = authUser?.users?.find(u => u.email === userEmail);

    if (!user) {
      return res.status(200).json({ received: true });
    }

    if (eventName === 'subscription_created' || (eventName === 'subscription_updated' && status === 'active')) {
      await supabase
        .from('profiles')
        .update({
          is_pro: true,
          lemonsqueezy_subscription_id: subscriptionId,
        })
        .eq('id', user.id);
    }

    if (
      eventName === 'subscription_cancelled' ||
      eventName === 'subscription_expired' ||
      (eventName === 'subscription_updated' && status !== 'active')
    ) {
      await supabase
        .from('profiles')
        .update({
          is_pro: false,
          lemonsqueezy_subscription_id: null,
        })
        .eq('id', user.id);
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
