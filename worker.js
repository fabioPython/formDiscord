export default {
  async fetch(request, env) {
    const allowedOrigins = env.YOUR_DOMAIN.split(",");
    const origin = request.headers.get("Origin");

    const corsHeaders = {
      "Content-Type": "application/json",
    };

    // Add CORS headers if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      corsHeaders["Access-Control-Allow-Origin"] = origin;
      corsHeaders["Access-Control-Allow-Methods"] = "POST, OPTIONS";
      corsHeaders["Access-Control-Allow-Headers"] = "Content-Type";
    }

    // ✅ Handle preflight request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Only allow POST
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: corsHeaders,
        }
      );
    }

    try {
      const { name, email, message } = await request.json();

      // Basic validation
      if (!name || !email || !message) {
        return new Response(
          JSON.stringify({ error: "Missing fields" }),
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // Send to Discord webhook
      await fetch(env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📩 New form submission!\n\n**Name:** ${name}\n**Email:** ${email}\n**Message:** ${message}`
        })
      });

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: corsHeaders,
        }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Server error" }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  }
};
