const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
// const Skill = require('../models/Skill');  // COMMENTATO PER TEST

// ============================================
// POST /api/bookings - Crea una prenotazione (TEST)
// ============================================
router.post('/', async (req, res) => {
    try {
        const { skillId, date, timeSlot, notes, clientId, professionalId } = req.body;

        if (!skillId || !date || !timeSlot) {
            return res.status(400).json({
                success: false,
                error: 'skillId, date e timeSlot sono obbligatori'
            });
        }

        // COMMENTATO PER TEST
        // const skill = await Skill.findById(skillId);
        // if (!skill) {
        //     return res.status(404).json({
        //         success: false,
        //         error: 'Competenza non trovata'
        //     });
        // }

        const actualClientId = clientId || 'test-client-123';
        const actualProfessionalId = professionalId || 'test-prof-123';

        const existingBooking = await Booking.findOne({
            professionalId: actualProfessionalId,
            date: new Date(date),
            timeSlot: timeSlot,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (existingBooking) {
            return res.status(409).json({
                success: false,
                error: 'Orario già prenotato'
            });
        }

        const booking = new Booking({
            skillId,
            clientId: actualClientId,
            professionalId: actualProfessionalId,
            date: new Date(date),
            timeSlot,
            notes,
            status: 'pending'
        });

        await booking.save();

        res.status(201).json({
            success: true,
            data: booking,
            message: 'Prenotazione creata con successo'
        });

    } catch (error) {
        console.error('Errore creazione prenotazione:', error);
        res.status(500).json({
            success: false,
            error: 'Errore interno del server'
        });
    }
});

// ============================================
// GET /api/bookings/user/:userId - Lista prenotazioni
// ============================================
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { status, limit = 20, page = 1 } = req.query;

        const filter = {
            $or: [
                { clientId: userId },
                { professionalId: userId }
            ]
        };

        if (status) {
            filter.status = status;
        }

        const bookings = await Booking.find(filter)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Booking.countDocuments(filter);

        res.json({
            success: true,
            data: bookings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Errore lista prenotazioni:', error);
        res.status(500).json({
            success: false,
            error: 'Errore interno del server'
        });
    }
});

// ============================================
// GET /api/bookings/available-slots - Slots disponibili
// ============================================
router.get('/available-slots', async (req, res) => {
    try {
        const { professionalId, date } = req.query;

        if (!professionalId || !date) {
            return res.status(400).json({
                success: false,
                error: 'professionalId e date sono obbligatori'
            });
        }

        const allSlots = [
            '09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
        ];

        const bookedSlots = await Booking.find({
            professionalId,
            date: new Date(date),
            status: { $nin: ['cancelled', 'completed'] }
        }).distinct('timeSlot');

        const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

        res.json({
            success: true,
            data: {
                date,
                availableSlots,
                bookedSlots
            }
        });

    } catch (error) {
        console.error('Errore slots disponibili:', error);
        res.status(500).json({
            success: false,
            error: 'Errore interno del server'
        });
    }
});

// ============================================
// PUT /api/bookings/:id/status - Aggiorna stato
// ============================================
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Stato non valido'
            });
        }

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                error: 'Prenotazione non trovata'
            });
        }

        booking.status = status;
        if (status === 'completed') {
            booking.completedAt = new Date();
        }
        booking.updatedAt = new Date();
        await booking.save();

        res.json({
            success: true,
            data: booking,
            message: `Stato aggiornato a ${status}`
        });

    } catch (error) {
        console.error('Errore aggiornamento stato:', error);
        res.status(500).json({
            success: false,
            error: 'Errore interno del server'
        });
    }
});
router.post('/', async (req, res) => {
    try {
        console.log('📩 Richiesta ricevuta:', req.body);

        const { skillId, date, timeSlot, notes, clientId, professionalId } = req.body;

        if (!skillId || !date || !timeSlot) {
            console.log('❌ Campi mancanti');
            return res.status(400).json({
                success: false,
                error: 'skillId, date e timeSlot sono obbligatori'
            });
        }

        const actualClientId = clientId || 'test-client-123';
        const actualProfessionalId = professionalId || 'test-prof-123';

        console.log(`🔍 Verifica orario per: ${actualProfessionalId} - ${date} - ${timeSlot}`);

        const existingBooking = await Booking.findOne({
            professionalId: actualProfessionalId,
            date: new Date(date),
            timeSlot: timeSlot,
            status: { $nin: ['cancelled', 'completed'] }
        });

        if (existingBooking) {
            console.log('❌ Orario già prenotato');
            return res.status(409).json({
                success: false,
                error: 'Orario già prenotato'
            });
        }

        const booking = new Booking({
            skillId,
            clientId: actualClientId,
            professionalId: actualProfessionalId,
            date: new Date(date),
            timeSlot,
            notes,
            status: 'pending'
        });

        await booking.save();

        console.log('✅ Booking creato:', booking._id);

        res.status(201).json({
            success: true,
            data: booking,
            message: 'Prenotazione creata con successo'
        });

    } catch (error) {
        console.error('❌ ERRORE creazione prenotazione:', error);
        console.error('❌ Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Errore interno del server'
        });
    }
});
module.exports = router;