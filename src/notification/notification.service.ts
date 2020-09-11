import { Injectable } from '@nestjs/common';
import {InjectMailer,Mailer} from 'nestjs-mailer'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from 'src/required/interfaces/user.interface';
import * as randomatic from 'randomatic'
  
import { v4 as uuid } from 'uuid';
import { stringify } from 'querystring';
import { username } from 'src/required/dto/username.dto';


@Injectable()
export class NotificationService {

    constructor(
        @InjectMailer() private readonly mailer: Mailer,
        @InjectModel('user')  private readonly user:Model<user>){}


 

    async sendEmail(name:string,key:number)
    {
        const email = await this.user.findOne().where('username').equals(name).select('email');
        let link = key
        this.mailer.sendMail
        ({
            to: email, //Receivers email address
            from: 'user@outlook.com', // Senders email address
            subject: 'Testing Nest Mailermodule for Roshambo ✔',
            text: String(Math.floor(100000 + Math. random() * 900000)),
            html: "Enter this key to verify you are legit"+link
            // template('template/index.hbs', { name: 'durward' })
        }).catch(e => console.log(e));
        
       return email
    }
}
