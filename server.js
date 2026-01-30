
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Configuration PostgreSQL
const pool = new Pool({
  user: 'support_user',
  host: 'localhost',
  database: 'support_eye_db',
  password: 'VotreMotDePasseSecurise123!',
  port: 5432,
});

// Configuration SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", 
  port: 587,
  secure: false,
  auth: {
    user: "votre-email@gmail.com", 
    pass: "votre-mot-de-pass-application"
  }
});

// Route pour vérifier une session
app.get('/api/session/:token', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE token = $1 AND status != $2',
      [req.params.token, 'COMPLETED']
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Session non trouvée ou expirée" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour envoyer le SMS et créer la session
app.post('/api/send-sms', async (req, res) => {
  const { phone, gateway, token, language } = req.body;
  
  try {
    // 1. Enregistrement PostgreSQL
    await pool.query(
      'INSERT INTO sessions (token, client_phone, carrier, status) VALUES ($1, $2, $3, $4)',
      [token, phone, gateway, 'WAITING']
    );

    // 2. Envoi du SMS (Email-to-SMS)
    const cleanPhone = phone.replace(/\D/g, '');
    const recipient = `${cleanPhone}@${gateway}`;
    const link = `https://rualgondol.com/?session=${token}`;
    const text = language === 'FR' 
      ? `Support-Eye: Votre technicien vous attend. Cliquez ici: ${link}`
      : `Support-Eye: Your technician is ready. Click here: ${link}`;

    await transporter.sendMail({
      from: '"Support-Eye" <votre-email@gmail.com>',
      to: recipient,
      text: text
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Échec de l'opération" });
  }
});

// WebSocket : Signalisation et Mise à jour du statut
io.on('connection', (socket) => {
  socket.on('join-session', async (token) => {
    socket.join(token);
    try {
      await pool.query('UPDATE sessions SET status = $1 WHERE token = $2', ['CONNECTED', token]);
    } catch (e) { console.error(e); }
  });

  socket.on('signal', ({ token, data }) => {
    socket.to(token).emit('signal', data);
  });

  socket.on('draw', ({ token, annotation }) => {
    socket.to(token).emit('draw', annotation);
  });

  socket.on('end-session', async (token) => {
    try {
      await pool.query('UPDATE sessions SET status = $1 WHERE token = $2', ['COMPLETED', token]);
      io.to(token).emit('session-ended');
    } catch (e) { console.error(e); }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Support-Eye SISL tourne sur le port ${PORT} avec PostgreSQL`);
});
