import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending emails via Resend
  app.post('/api/send-email', async (req, res) => {
    try {
      const { to, subject, html } = req.body;
      const resendApiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

      if (!resendApiKey) {
        return res.status(500).json({ 
          success: false, 
          error: 'Resend API key is not configured on the server. Please check your environment variables.' 
        });
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Pars Mazi Edit Archive <noreply@resend.dev>',
          to: to,
          subject: subject,
          html: html,
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        return res.json({ success: true, data: responseData });
      } else {
        return res.status(response.status).json({ success: false, error: responseData });
      }
    } catch (error: any) {
      console.error('Error in /api/send-email:', error);
      return res.status(500).json({ success: false, error: error.message || error });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
