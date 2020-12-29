import * as mongoose from  'mongoose';

export const request =new mongoose.Schema({
    
    gameid:{type:String},
    host:{type:String},
    invitee:{type:String},
    lastUpdated:{type:Date},
    status:{type:String}

 })