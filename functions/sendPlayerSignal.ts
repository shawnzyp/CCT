import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, sessionId, type, payload } = body;

    if (!campaignId || !sessionId || !type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const signal = await base44.asServiceRole.entities.PlayerSignal.create({
      campaignId,
      sessionId,
      playerId: user.email,
      playerEmail: user.email,
      type,
      payload,
      read: false
    });

    return Response.json({
      signalId: signal.id,
      type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});