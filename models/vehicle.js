const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
    vehicleNumber:{
        type:String,
        required:true,
        unique:true,
        uppercase:true
    },
    ownerName:{
        type:String,
        required:true
    },
    mobileNo:{
        type:String,
        required:true,
    },
    vehicleType:{
        type:String,
        enum:['BIKE','CAR','TRUCK']
    }
},{
    timestamps:true
})

vehicleSchema.index({
    vehicleNumber:-1
})

module.exports = mongoose.model('vehicle',vehicleSchema)