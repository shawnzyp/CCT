import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, campaignId, sessionId } = body;

    if (!eventId || !campaignId || !sessionId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find and update delivery record
    const deliveries = await base44.asServiceRole.entities.EventDelivery.filter({
      eventId,
      campaignId,
      sessionId,
      recipientId: user.email
    });

    if (deliveries.length === 0) {
      return Response.json({ error: 'Delivery not found' }, { status: 404 });
    }

    const delivery = deliveries[0];

    await base44.asServiceRole.entities.EventDelivery.update(delivery.id, {
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});