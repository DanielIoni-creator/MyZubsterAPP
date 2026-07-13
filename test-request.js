const http = require('http');

const data = JSON.stringify({
  userId: 'user123',
  items: [
    { name: 'Prodotto A', quantity: 2, price: 10 },
    { name: 'Prodotto B', quantity: 1, price: 25 }
  ],
  total: 45,
  currency: 'XMR'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log('Stato:', res.statusCode);
    console.log('Risposta:', JSON.parse(responseData));
  });
});

req.on('error', (error) => {
  console.error('Errore:', error.message);
});

req.write(data);
req.end();