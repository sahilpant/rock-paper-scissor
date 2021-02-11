import { Mongoose } from "mongoose";

import * as mongoose from 'mongoose'
export interface asset extends mongoose.Document{
    publickey:string;
    lastupdated:Date;
}