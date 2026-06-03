const express = require('express');
const router = express.Router();
const {addVehicle,getAllVehicles,getVehicleById,updateVehicle} = require('../controllers/vehicleController');
router.post('/add', addVehicle);
router.get('/all', getAllVehicles);
router.get('/:id', getVehicleById);
router.put('/update/:id', updateVehicle);
module.exports = router