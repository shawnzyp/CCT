import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { joinCode } = body;

    if (!joinCode) {
      return Response.json({ error: 'Missing joinCode' }, { status: 400 });
    }

    // Find session by join code
    const sessions = await base44.asServiceRole.entities.SessionLink.filter({
      joinCode: joinCode.toUpperCase()
    });

    if (sessions.length === 0) {
      return Response.json({ error: 'Invalid join code' }, { status: 404 });
    }

    const session = sessions[0];

    // Add player to session
    const updatedPlayerIds = [...(session.playerIds || [])];
    if (!updatedPlayerIds.includes(user.email)) {
      updatedPlayerIds.push(user.email);
    }

    await base44.asServiceRole.entities.SessionLink.update(session.id, {
      playerIds: updatedPlayerIds,
      lastActivityAt: new Date().toISOString()
    });

    // Create initial presence record
    await base44.asServiceRole.entities.Presence.create({
      userId: user.email,
      role: 'PLAYER',
      campaignId: session.campaignId,
      sessionId: session.sessionId,
      status: 'online',
      lastSeenAt: new Date().toISOString(),
      clientVersion: '1.0',
      schemaVersion: '1.0'
    });

    return Response.json({
      campaignId: session.campaignId,
      sessionId: session.sessionId,
      directorId: session.directorId,
      sessionName: session.sessionName
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});