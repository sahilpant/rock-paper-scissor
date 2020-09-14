import * as mongoose from 'mongoose'

export interface EmailVerify extends mongoose.Document{

    name:string,

    key:string
}