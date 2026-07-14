// config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyZubster API',
      version: '1.0.0',
      description: 'API per la gestione di ordini e pagamenti Monero',
      contact: {
        name: 'Daniel Ioni',
        email: 'danielioni@myzubster.com',
        url: 'https://github.com/DanielIoni-creator/MyZubsterAPP'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Server di sviluppo'
      },
      {
        url: 'https://myzubster-backend.onrender.com',
        description: 'Server di produzione (Render)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        csrfAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'CSRF-Token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'string' },
            userId: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                  subtotal: { type: 'number' }
                }
              }
            },
            total: { type: 'number' },
            currency: { type: 'string', enum: ['XMR', 'EUR', 'USD'] },
            status: { type: 'string', enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] },
            paymentStatus: { type: 'string', enum: ['pending', 'confirmed', 'failed'] },
            paymentDetails: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderId: { type: 'string' },
            address: { type: 'string' },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'confirmed', 'failed'] },
            qrCode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
        csrfAuth: []
      }
    ],
    tags: [
      { name: 'Auth', description: 'Autenticazione e gestione utenti' },
      { name: 'Orders', description: 'Gestione ordini' },
      { name: 'Payments', description: 'Gestione pagamenti Monero' },
      { name: 'Security', description: 'Token CSRF e sicurezza' }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './server.js'
  ]
};

module.exports = swaggerJsdoc(options);