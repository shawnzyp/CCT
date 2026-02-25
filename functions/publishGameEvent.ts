import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, sessionId, type, payload, recipients } = body;

    if (!campaignId || !sessionId || !type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user is director of this session
    const sessions = await base44.asServiceRole.entities.SessionLink.filter({
      campaignId,
      sessionId
    });

    if (sessions.length === 0 || sessions[0].directorId !== user.email) {
      return Response.json({ error: 'Forbidden: Not session director' }, { status: 403 });
    }

    const session = sessions[0];

    // Get next sequence number
    const sequenceNumber = session.eventSequence || 0;

    // Create event
    const event = await base44.asServiceRole.entities.GameEvent.create({
      campaignId,
      sessionId,
      type,
      payload,
      recipients: recipients || 'ALL',
      createdBy: 'DIRECTOR',
      visibility: 'player',
      sequenceNumber
    });

    // Create delivery records for all recipients
    const playerIds = recipients === 'ALL' ? session.playerIds : recipients;
    if (playerIds && playerIds.length > 0) {
      const deliveries = playerIds.map(playerId => ({
        eventId: event.id,
        campaignId,
        sessionId,
        recipientId: playerId,
        recipientEmail: playerId,
        status: 'pending'
      }));

      for (const delivery of deliveries) {
        await base44.asServiceRole.entities.EventDelivery.create(delivery);
      }
    }

    // Update session
    await base44.asServiceRole.entities.SessionLink.update(session.id, {
      eventSequence: sequenceNumber + 1,
      lastActivityAt: new Date().toISOString()
    });

    return Response.json({
      eventId: event.id,
      sequenceNumber,
      deliveryCount: playerIds?.length || 0
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});