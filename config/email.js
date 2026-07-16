// config/email.js
const nodemailer = require('nodemailer');

// Configura il transport (usa Gmail o un servizio SMTP)
// Per Gmail: abilita "App Password" su https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true per 465, false per 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Template email per conferma ordine
const getOrderConfirmationTemplate = (order) => {
  return {
    subject: `✅ Ordine confermato #${order.orderNumber}`,
    html: `
      <h2>Grazie per il tuo ordine!</h2>
      <p>Ciao ${order.userId?.name || 'Utente'},</p>
      <p>Il tuo ordine <strong>#${order.orderNumber}</strong> è stato creato con successo.</p>
      <p><strong>Totale:</strong> ${order.total} ${order.currency}</p>
      <p><strong>Stato:</strong> ${order.status}</p>
      <p>Per completare il pagamento, utilizza il seguente indirizzo Monero:</p>
      <pre style="background:#f4f4f4;padding:10px;border-radius:4px;word-break:break-all;">
        ${order.paymentDetails?.address || 'Indirizzo non disponibile'}
      </pre>
      <p>Il pagamento verrà confermato automaticamente dopo 10 conferme (~20 minuti).</p>
      <br>
      <p>Grazie,</p>
      <p>Il team di MyZubster</p>
    `,
  };
};

// Template email per pagamento confermato
const getPaymentConfirmationTemplate = (order) => {
  return {
    subject: `💰 Pagamento confermato #${order.orderNumber}`,
    html: `
      <h2>🎉 Pagamento ricevuto!</h2>
      <p>Ciao ${order.userId?.name || 'Utente'},</p>
      <p>Il pagamento per l'ordine <strong>#${order.orderNumber}</strong> è stato confermato.</p>
      <p><strong>Importo:</strong> ${order.total} ${order.currency}</p>
      <p><strong>Stato:</strong> ✅ Pagato</p>
      <br>
      <p>Grazie per il tuo acquisto!</p>
      <p>Il team di MyZubster</p>
    `,
  };
};

// Template email per promemoria pagamento
const getPaymentReminderTemplate = (order) => {
  return {
    subject: `⏳ Promemoria pagamento #${order.orderNumber}`,
    html: `
      <h2>⏳ Promemoria pagamento</h2>
      <p>Ciao ${order.userId?.name || 'Utente'},</p>
      <p>L'ordine <strong>#${order.orderNumber}</strong> è ancora in attesa di pagamento.</p>
      <p><strong>Totale:</strong> ${order.total} ${order.currency}</p>
      <p>Per completare l'acquisto, invia il pagamento al seguente indirizzo Monero:</p>
      <pre style="background:#f4f4f4;padding:10px;border-radius:4px;word-break:break-all;">
        ${order.paymentDetails?.address || 'Indirizzo non disponibile'}
      </pre>
      <p>Hai tempo fino a <strong>${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleString()}</strong> per completare il pagamento.</p>
      <br>
      <p>Grazie,</p>
      <p>Il team di MyZubster</p>
    `,
  };
};

// Funzione per inviare email
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"MyZubster" <noreply@myzubster.com>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email inviata a ${to}: ${subject}`);
    return info;
  } catch (error) {
    console.error('❌ Errore invio email:', error.message);
    return null;
  }
};

module.exports = {
  sendEmail,
  getOrderConfirmationTemplate,
  getPaymentConfirmationTemplate,
  getPaymentReminderTemplate,
};