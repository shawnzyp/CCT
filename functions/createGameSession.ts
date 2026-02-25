import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

function generateJoinCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { campaignId, sessionName } = body;

    if (!campaignId || !sessionName) {
      return Response.json({ error: 'Missing campaignId or sessionName' }, { status: 400 });
    }

    const sessionId = crypto.randomUUID();
    const joinCode = generateJoinCode();

    const sessionLink = await base44.asServiceRole.entities.SessionLink.create({
      campaignId,
      sessionId,
      directorId: user.email,
      joinCode,
      sessionName,
      status: 'active',
      playerIds: [],
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      eventSequence: 0
    });

    return Response.json({
      sessionId,
      joinCode,
      sessionLink
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});