import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, sessionId, status } = body;

    if (!campaignId || !sessionId || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find or create presence
    const existingPresence = await base44.asServiceRole.entities.Presence.filter({
      userId: user.email,
      campaignId,
      sessionId
    });

    const now = new Date().toISOString();

    if (existingPresence.length > 0) {
      await base44.asServiceRole.entities.Presence.update(existingPresence[0].id, {
        status,
        lastSeenAt: now
      });
    } else {
      await base44.asServiceRole.entities.Presence.create({
        userId: user.email,
        role: user.role === 'admin' ? 'DIRECTOR' : 'PLAYER',
        campaignId,
        sessionId,
        status,
        lastSeenAt: now,
        clientVersion: '1.0',
        schemaVersion: '1.0'
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});