import * as mongoose from 'mongoose'

export interface EmailVerify extends mongoose.Document{

    email:string,

    key:string
}