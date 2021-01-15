import * as mongoose from  'mongoose';

export interface match extends mongoose.Document{

    gameid:String,
    publickey:String,
    status:String       
}