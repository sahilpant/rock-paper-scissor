import { boolean, date, number, object, string } from '@hapi/joi'
import * as mongoose from 'mongoose'

export const cardToBeBid = new mongoose.Schema({


    date:{type:Date},

    bidded:{type:Boolean,default:true},
   
    sold:{type:Boolean,default:false},
   
    user_email:{type:String},

    cardid:{type:Number},

    cardtype:{type:String},

    setbidprice:{type:Number},

    currentBids:{type:Array,default:[]}

})