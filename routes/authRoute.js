const express = require('express')
const router = express.Router()
const { register, login, getProfile, verifyToken } = require('../controllers/authController')

// Register a new admin
router.post('/register', register)

// Login
router.post('/login', login)

// Get profile (protected route)
router.get('/profile', verifyToken, getProfile)

module.exports = router