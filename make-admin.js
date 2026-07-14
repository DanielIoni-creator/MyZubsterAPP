// make-admin.js
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const email = 'test@example.com'; // Cambia con la tua email
    const user = await User.findOneAndUpdate(
      { email },
      { role: 'admin' },
      { new: true }
    );
    
    if (user) {
      console.log(`✅ Utente ${user.email} aggiornato a ADMIN`);
    } else {
      console.log(`❌ Utente con email ${email} non trovato. Registrati prima.`);
    }
  } catch (error) {
    console.error('❌ Errore:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

makeAdmin();