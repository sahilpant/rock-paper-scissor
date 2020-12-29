import * as mongoose from  'mongoose';

export interface request extends mongoose.Document{    
    gameid:string,
    host:string,
    invitee:string,
    lastUpdated:Date,
    status:string
    
 }