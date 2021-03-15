import { Injectable, UnauthorizedException, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import { JwtPayLoad } from './required/interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt'
import { signin } from './required/dto/sign.dto';
import {returnownedTokens,detailOfCard,show_stars, assetReplinshment} from '../gameblock';
import { date } from '@hapi/joi';
import { publickey } from './required/dto/publickey.dto';
import { asset } from './required/interfaces/assetReplenish.interface';
@Injectable()
export class AppService 
{

  accessToken="token"
  
  constructor(
              private jwtService:JwtService,
              
              @InjectModel('user')  private readonly user:Model<user>,
              @InjectModel('assetReplenish') private readonly asset:Model<asset>){}

              async getUserdetails(publickey):Promise<any>{
                try{
                  await this.updateUserdata(publickey);
                  return this.user.findOne({publickey:publickey});
                }
                catch(err){

                  return new BadRequestException(err.message);

                }

              }

              async assetReplenishEvery24Hour({publickey}:publickey):Promise<any>{
                let user = await this.asset.findOne({publickey:publickey});
                if(user){
                const oneDay = 24 * 60 * 60 * 1000;
                const LastDate =user.lastupdated.getTime();
                const CurrentDate = new Date().getTime();
                  if(Math.abs((CurrentDate - LastDate)/oneDay) >= 1){
                      (user).lastupdated = new Date();
                      await (user).save();
                      await assetReplinshment(publickey);
                      await this.updateUserdata(publickey);
                      return `Cards replenished successfully`
                  }
                  else
                  return `Cards are repleninshed only after every 24 hrs. Time remaining ${(LastDate+oneDay-CurrentDate)/1000}s`
                }
                else{
                  let new_user = new this.asset();
                  new_user.publickey = publickey;
                  new_user.lastupdated = new Date;
                  await new_user.save();
                  await assetReplinshment(publickey);
                  await this.updateUserdata(publickey);
                }         
              }


              async updateUserdata(publickey:string):Promise<any>{

                var userinDB = await this.user.findOne({publickey: `${publickey}`}).exec()
                if(!userinDB)
  
                {
  
                  throw new UnauthorizedException('invalid_publickey');
  
                }
                else
                {
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
                  userinDB.lastupdated = new Date;
                  var response ={
                     Status:"User Data Updated",
                     userdetails:await userinDB.save()
                  }
                  return response;  
                  }

                  else{
                   console.log("Details are already updated")
                   var response ={
                    Status:"User Data Is Upto Date",
                    userdetails:userinDB
                 }
                 return response; 
                  }  
                }
    
                    

              }

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
                  console.log(result);
                  if(result)
                  {
                    const payload:JwtPayLoad = {email: userinDB.email ,username: userinDB.username, role: userinDB.role = 'PLAYER'}
                    this.accessToken= this.jwtService.sign(payload);
                    let arrofCards = await returnownedTokens(userinDB.publickey);
                    var rock = [];
                    var paper = [];
                    var scissor = [];
                    var notUSed = [];
                    var completearray = userinDB.notUsedCards.concat(userinDB.usedCards);
                    var isNewCardPresent = arrofCards.filter(function(id){
                      return completearray.indexOf(id) < 0;
                    })
                    console.log("isnecardpresent =>",isNewCardPresent);
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
    
