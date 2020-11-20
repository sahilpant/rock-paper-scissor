import { BadRequestException, Injectable } from '@nestjs/common';
import {InjectMailer,Mailer} from 'nestjs-mailer'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from 'src/required/interfaces/user.interface';
import { EventsGateway } from 'src/models/user/user.gateway';



@Injectable()
export class NotificationService {

    constructor(

        @InjectMailer() private readonly mailer: Mailer,

        @InjectModel('user')  private readonly user:Model<user>,
        
     private Eventgateway:EventsGateway){}
 

    async sendEmail(email:string,key:number)
    {
        try{
        const foundEmail = await this.user.findOne().where('email').equals(email).select('email');

        let link = key

        this.mailer.sendMail
        ({

            to: email, //Receivers email address
            
            from: 'user@outlook.com', // Senders email address
            
            subject: 'Testing Nest Mailermodule for Roshambo ✔',
            
            text: "Enter this key to verify you are legit",
            
            html: `<b><i> ${link} <i><b>`
            // template('template/index.hbs', { name: 'durward' })
        }).catch(e => console.log(e));
        
       return email
    }
    catch(err){
        throw new BadRequestException(err.message);
    }
    }
    async send_room_code(email:string,room_id:string)
    {
        try{
        this.mailer.sendMail
        ({

            to: email, //Receivers email address

            subject: 'Join game with this code',

            html: `<h1>${room_id}</h1>`
        }).catch((e: any) => console.log(e));
        
       return email}
       catch(err){
           throw new BadRequestException(err.message);
       }
    }

    async test(id:string){
        await this.Eventgateway.wss.to(id).emit('notification',"notification sent successfully")
    }

}
