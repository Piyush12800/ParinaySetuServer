const mongoose = require('mongoose')
const mamaSchema= new mongoose.Schema({
    mamaName:{
        type:String
    },
    mamaAge:{
        type:Number
    },
    mamaStatus:{
        type:Boolean,
    }

})
const mausiSchema= new mongoose.Schema({
    mausiName:{
        type:String
    },
    mausiAge:{
        type:Number
    },
    mausiStatus:{
        type:Boolean,
    }


})

const MotherFamilySchema = new mongoose.Schema({
    grandMother:{
        type:String
    },
   
    grandMotherAge:{
        type:Number
    },

    grandMotherStatus:{
        type:Boolean,
    },
   
    mama:[mamaSchema],
    mausi:[mausiSchema],
    
})
module.exports = mongoose.model('MotherFamily',MotherFamilySchema)