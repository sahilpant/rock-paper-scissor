import { PassportStrategy  } from '@nestjs/passport';
import{  Strategy,ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException, } from '@nestjs/common';
import { JwtPayLoad } from './required/interfaces/jwt-payload.interface';
import { user } from './required/interfaces/user.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

// import * as config from 'config';


@Injectable()

export class jwtStrategy extends PassportStrategy(Strategy){

    constructor(@InjectModel('user')  private readonly user:Model<user> ){
    
        super({
    
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    
            secretOrKey: 'hello',
    
        });


    }


    async validate(payload:JwtPayLoad):Promise<any>{

        const  { email,role }  = payload;

        console.log(payload)

        // console.log(payload)

        console.log(role);
        const user = await this.user.findOne({email : `${email}`, role:`${role}`});

        return user;

    }

}