const express = require('express');
const router = express.Router();

// GET /api/skills/nearby?lat=<latitude>&lng=<longitude>
router.get('/nearby', (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    console.log(`📍 Ricerca competenze vicine a lat: ${lat}, lng: ${lng}`);

    // Dati mock
    const mockSkills = [
        {
            id: "1",
            title: "Riparazione lavatrice",
            description: "Riparo lavatrici a domicilio",
            category: "Elettrodomestici",
            price: 50,
            distanceKm: 2.3,
            location: { coordinates: [12.5, 44.1] },
            userId: "user1",
            userName: "Mario Rossi"
        },
        {
            id: "2",
            title: "Taglio capelli a domicilio",
            description: "Parrucchiere professionista",
            category: "Estetica",
            price: 25,
            distanceKm: 3.7,
            location: { coordinates: [12.6, 44.0] },
            userId: "user2",
            userName: "Lucia Bianchi"
        }
    ];

    res.json({
        success: true,
        data: mockSkills,
        count: mockSkills.length
    });
});

module.exports = router;