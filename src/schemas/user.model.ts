import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt'

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
    
        ROCK:{type:Array},
    
        PAPER:{type:Array},
    
        SCISSOR:{type:Array}
    
    },

    
    stars:{type:Number},
    
    
    publickey:{type:String,
    
        required:true},

    
    lastupdated:{type:Date},

    userinBlockchain:{type:Boolean},

    client_id:{type:String},
    
    salt:{type:String},

    password:{
        
        type:String,
    
        required:true},


    });



