const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    bookingId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'booking'
    },
    amount:{
        type:Number,
        required:true
    },
    paymentMethod:{
        type:String,
        enum:['CASH','UPI','CARD']
    },
    paymentDate:{
        type:Date,
        default:Date.now
    }
},{timestamps:true})

paymentSchema.index({
   paymentDate:-1
})

module.exports = mongoose.model('payment',paymentSchema)