import { string } from '@hapi/joi';
import * as mongoose from 'mongoose';


export const assetReplenish = new mongoose.Schema({
    publickey:{type:String},
    
    lastupdated:{type:Date},
});



