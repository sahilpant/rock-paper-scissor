import { Injectable, UnauthorizedException, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import { JwtPayLoad } from './required/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt'
import { signin } from './required/dto/sign.dto';
import {returnownedTokens,detailOfCard,show_stars} from '../gameblock';
@Injectable()
export class AppService 
{

  accessToken="token"
  
  constructor(
              private jwtService:JwtService,
              
              @InjectModel('user')  private readonly user:Model<user>){}

              async validatePassword(realPassword:string,givenPassword:string,salt:string):Promise<boolean>{
  
                const hash = await bcrypt.hash(givenPassword,salt);
  
                return realPassword === hash;
  
              }    
  
  

  
              async signIn(signin : signin):Promise<string>{
  
                const userinDB = await this.user.findOne({email: `${signin.email}`}).exec();
  
                // console.log(userinDB)
  
                if(!userinDB)
  
                {
  
                  throw new UnauthorizedException('invalid_email');
  
                }
  
                else
  
                {
                  const result = await this.validatePassword(userinDB.password,signin.password,userinDB.salt);   
                  if(result)
                  {
                    const payload:JwtPayLoad = {email: userinDB.email ,username: userinDB.username, role: userinDB.role = 'PLAYER'}
                    this.accessToken= this.jwtService.sign(payload);
                    let arrofCards = await returnownedTokens(userinDB.publickey)
                    var rock = [];
                    var paper = [];
                    var scissor = [];
                    var notUSed = [];
                    var completearray = userinDB.notUsedCards.concat(userinDB.usedCards);
                    // console.log(<Int32Array>arrofCards);
                    var isNewCardPresent = arrofCards.filter(function(id){
                      return completearray.indexOf(id) < 0;
                    })

                    if(isNewCardPresent.length > 0){

                      for(var i=0;i<arrofCards.length;i++)
                    {
                      let carddetail = await detailOfCard(arrofCards[i]);

                      if(carddetail[0] === "1")
                      rock.push(arrofCards[i]);
                      else if(carddetail[0] === "2")
                      paper.push(arrofCards[i]);
                      else if(carddetail[0] === "3")
                      scissor.push(arrofCards[i]);
                      notUSed.push(arrofCards[i]);
                    }
                    var c =  rock.filter(function(id){
                      return userinDB.usedCards.indexOf(id) < 0
                    })

                    var d =  paper.filter(function(id){
                      return userinDB.usedCards.indexOf(id) < 0
                    })

                    var e =  scissor.filter(function(id){
                      return userinDB.usedCards.indexOf(id) < 0
                    })
                    var f = notUSed.filter(function(id){
                         return userinDB.usedCards.indexOf(id) < 0
                    })
                    userinDB.cards.ROCK = c; 
						        userinDB.cards.PAPER = d;
						        userinDB.cards.SCISSOR = e;
						        userinDB.notUsedCards = f;
						        userinDB.stars = await show_stars(userinDB.publickey);
						        await userinDB.save();  
                    return  this.accessToken;
                    }

                    else{
                     console.log("I was here")
                      return  this.accessToken;
                    }  
                  }
  
                  else
                  throw new UnauthorizedException('invalid_password');
  
                }

              }


            }
    
