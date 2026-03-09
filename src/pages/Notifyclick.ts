// supabase/functions/notify-click/index.ts
// Deploy with: supabase functions deploy notify-click

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { link_id, user_id, link_title, visitor_info } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get profile + check if notifications enabled
    const { data: profile } = await supabase
      .from("profiles")
      .select("*, notify_on_click, display_name")
      .eq("id", user_id)
      .maybeSingle();

    if (!profile?.notify_on_click) {
      return new Response(JSON.stringify({ skipped: true }), { headers: corsHeaders });
    }

    // Get user email
    const { data: { user } } = await supabase.auth.admin.getUserById(user_id);
    const email = user?.email;
    if (!email) return new Response(JSON.stringify({ error: "no email" }), { headers: corsHeaders });

    // Insert in-app notification
    await supabase.from("notifications").insert({
      user_id,
      type: "click",
      message: `Someone clicked your link "${link_title}"`,
    });

    // Send email via Supabase's built-in mailer (or use Resend/SendGrid)
    // Using fetch to send via Resend (add RESEND_API_KEY to edge function secrets)
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Linkso <notifications@yourdomain.com>",
          to: email,
          subject: `🔔 Someone clicked "${link_title}"`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <div style="background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 16px; padding: 32px; color: white; text-align: center; margin-bottom: 24px;">
                <h1 style="margin: 0; font-size: 28px;">🔔 Link Clicked!</h1>
              </div>
              <p style="color: #374151; font-size: 16px;">Hey <strong>${profile.display_name}</strong>,</p>
              <p style="color: #374151;">Someone just clicked your link <strong>"${link_title}"</strong> on your Linkso profile.</p>
              <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Time</p>
                <p style="margin: 4px 0 0; font-size: 16px; font-weight: 600; color: #111827;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
              </div>
              <a href="${Deno.env.get("SITE_URL") || "https://yourapp.com"}/dashboard" 
                style="display: block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; text-align: center; padding: 14px 24px; border-radius: 12px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                View Analytics →
              </a>
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                You're receiving this because you enabled click notifications.<br/>
                <a href="${Deno.env.get("SITE_URL") || "https://yourapp.com"}/dashboard" style="color: #667eea;">Turn off in Settings</a>
              </p>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});