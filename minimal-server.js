// Minimal test server
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is working' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});