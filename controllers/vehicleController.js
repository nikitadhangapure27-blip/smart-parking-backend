const Vehicle = require('../models/vehicle')

//Adding the vehicle
exports.addVehicle=async(req,res)=>{
    try{
        const { vehicleNumber, ownerName, mobileNo, vehicleType } = req.body
        const existingVehicle = await Vehicle.findOne({
            vehicleNumber:vehicleNumber.toUpperCase()
        })
        if(existingVehicle){
            return res.status(400).json({
                success:false,
                message:'Vehicle already exists'
            })
        }
        const vehicle = await Vehicle.create({
            vehicleNumber:vehicleNumber.toUpperCase(),ownerName,mobileNo,vehicleType
        })
        return res.status(201).json({
            success:true,
            message:'Vehicle added successfully !!',
            data:vehicle
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//Getting all vehicles
exports.getAllVehicles=async(req,res)=>{
    try{
        const allVehicles = await Vehicle.find().sort({ createdAt: -1 })
        return res.status(200).json({
            success:true,
            message:allVehicles.length,
            data:allVehicles
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//Gettinf single vehicle details
exports.getVehicleById=async(req,res)=>{
    try{
        //object is query parameter
        const objectId = req.params.id
        const vehicle = await Vehicle.findById(objectId)
        if(!vehicle){
            return res.status(404).json({
                success:false,
                message:'Vehicle not found !!'
            })
        }
        return res.status(200).json({
            success:true,
            data:vehicle
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//Updating existing vehicles
exports.updateVehicle=async(req,res)=>{
    try{
        const vehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new : true }
        )
        return res.status(200).json({
            success:true,
            message:'Vehicle updated !!'
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}