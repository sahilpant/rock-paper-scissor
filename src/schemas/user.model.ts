import { array } from '@hapi/joi';
import * as mongoose from 'mongoose';


export const user = new mongoose.Schema({
    
    username:{
    
        type:String,
    
        required:true
    
    },

    
    email:{
    
        type:String,
    
        required:true
    
    },

    
    cards:{
    
        ROCK:{type:[Number]},
    
        PAPER:{type:[Number]},
    
        SCISSOR:{type:[Number]}
    
    },

    usedCards:{
        type:[Number]
    },
    
    notUsedCards:{
        type:[Number]
    },

    stars:{type:Number},
    
    
    publickey:{type:String},

    
    lastupdated:{type:Date},

    userinBlockchain:{type:Boolean},
    
    salt:{type:String},

    password:{
        
        type:String,
    
        required:true
       },

    
    role : { type: String },

    cardForBid: {type:Array , default: []}
    
    });



