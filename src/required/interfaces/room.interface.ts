import * as mongoose from  'mongoose';

export interface room extends mongoose.Document{
    gameid:string,
    roomID:string

 }