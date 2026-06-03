const mongoose = require('mongoose')
const vehicle = require('./vehicle')
const { exists } = require('./Slot')

const bookingSchema = new mongoose.Schema({
    vehicleId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"vehicle"
    },
    slotId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Slot'     // ✅ Must match mongoose.model('Slot', slotSchema)
},
    entryTime:{
        type:Date,
        default:Date.now
    },
    exitTime:{
        type:Date
    },
    totalHours:{
        type:Number
    },
    status:{
        type:String,
        enum:['ACTIVE','COMPLETED'],
        default:'ACTIVE'
    }
},{timestamps:true})

bookingSchema.index({
    vehicleId:1,
    status:1
})

module.exports = mongoose.models.booking || mongoose.model('booking', bookingSchema);