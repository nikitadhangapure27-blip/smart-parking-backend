const Admin = require('../models/admin')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// JWT Secret Key
const JWT_SECRET = 'spms_super_secret_key_2024'

// Register Admin (First time setup)
exports.register = async (req, res) => {
    try {
        const { name, username, email, password } = req.body

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
            $or: [{ email }, { username }]
        })

        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin with this email or username already exists'
            })
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create admin
        const admin = await Admin.create({
            name,
            username,
            email,
            password: hashedPassword
        })

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        return res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                _id: admin._id,
                name: admin.name,
                username: admin.username,
                email: admin.email,
                token
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Login Admin
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Find admin by email
        const admin = await Admin.findOne({ email })

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, admin.password)

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            })
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id, email: admin.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        )

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: admin._id,
                name: admin.name,
                username: admin.username,
                email: admin.email,
                token
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get Admin Profile
exports.getProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.adminId).select('-password')
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            })
        }
        return res.status(200).json({
            success: true,
            data: admin
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Verify Token Middleware
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            })
        }
        const decoded = jwt.verify(token, JWT_SECRET)
        req.adminId = decoded.id
        next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        })
    }
}