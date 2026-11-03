// SK Cyber Hub LiveKit token endpoint.
// Deploy as Supabase Edge Function: sk-live-token.
// Store LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET as Supabase Function secrets.
// Never expose the LiveKit API secret in browser code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AccessToken } from "npm:livekit-server-sdk@2.19.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://habibullah-hub.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "Method not allowed." });

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) return reply(401, { error: "Sign in is required." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const livekitUrl = Deno.env.get("LIVEKIT_URL");
  const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
  const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");
  if (!supabaseUrl || !supabaseAnonKey || !livekitUrl || !livekitApiKey || !livekitApiSecret) {
    return reply(503, { error: "Live service is not configured. No media session was started." });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: auth, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !auth.user) return reply(401, { error: "Session is invalid. Sign in again." });

    const body = await req.json().catch(() => ({}));
    const roomName = String(body?.room || "");
    if (!/^[a-zA-Z0-9_-]{8,80}$/.test(roomName)) return reply(400, { error: "Invalid live room." });

    const { data: room, error: roomError } = await supabase
      .from("sk_live_rooms")
      .select("id,room_name,host_id,title,status")
      .eq("room_name", roomName)
      .eq("status", "live")
      .maybeSingle();
    if (roomError || !room) return reply(404, { error: "This live room is not available." });

    const { data: profile } = await supabase
      .from("sk_profiles")
      .select("display_name")
      .eq("id", auth.user.id)
      .maybeSingle();

    const isHost = room.host_id === auth.user.id;
    const access = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: auth.user.id,
      name: profile?.display_name || "SK Member",
      ttl: "1h",
    });
    access.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: isHost,
      canSubscribe: true,
      canPublishData: isHost,
    });
    const token = await access.toJwt();
    return reply(200, { serverUrl: livekitUrl, token, room: roomName, role: isHost ? "host" : "viewer" });
  } catch (_error) {
    return reply(500, { error: "Could not create a live session token." });
  }
});
