import { Injectable, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { user } from 'src/required/interfaces/user.interface';
import { InjectModel } from '@nestjs/mongoose';
import { passkey } from 'src/required/interfaces/passkey.interface';
import { match } from 'src/required/interfaces/match.interface';
// import {Transfer,burn} from '../../gameblock'
@Injectable()
export class PlayService {

     constructor(
                 @InjectModel('user') private readonly user:Model<user>,
      
                 @InjectModel('passkey') private readonly passkey:Model<passkey>,
                 
                 @InjectModel('match') private readonly match:Model<match>){}

    async play(gameid:string,)
{
  try{
    var winner = 0;  //0 if draw and 1 for user1 win and 2 for user2 win

    let game=await this.passkey.findOne().where('gameid').equals(gameid).exec()

    const card1=game.card1

    const card2=game.card2
    
    console.log(gameid+" "+card1+"  "+card2)
    
    const user1=game.user1
    
    const user2=game.user2

    const token1=game.token1

    const token2=game.token2

    console.log(card1+" "+card2);

    let arrOfCards=`[${card1}:${token1},${card2}:${token2}]`
     
    game.moves.push(arrOfCards)

    let existing_game =  await this.match.find({gameid:gameid});
 
    var currRound = existing_game[0].round + 1;

    var obj = {player1:{
      card_type:<String>card1,
      card_number:token1,
      timestamp:new Date
     },
      player2:{
      card_type:<String>card2,
      card_number:token2,
      timestamp:new Date
     }     
    }

let arr = existing_game[0].Rounds;
arr.push(obj);
    await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{
       'round':currRound,
       'Rounds':arr
    }, function(err: any,data: any){
      if( err) console.log(err);
    }})

    await game.save();


    if(card1 === card2)
    {}

    else
    {
      if( (card1 === "ROCK" && card2 === "SCISSOR") || (card1 === "PAPER" && card2 === "ROCK") || (card1 === "SCISSOR" && card2 === "PAPER") ){
          winner = 1;
      }
      else{
          winner = 2;
      }
  }
     
       
    console.log(winner);   
     
    if(winner === 1){  //user2 defeated
      
        const userno1= await this.user.findOne().where('username').equals(user1).exec();
      
        game=await this.passkey.findOne().where('gameid').equals(gameid).exec()
      
        game.playerWin.push(game.user1)
      
        console.log(user2+" is defeated ")
      
        userno1.stars+= 2   //here stars are removed from admin account also

        let existing_game =  await this.match.find({gameid:gameid})

				existing_game[0].stars_of_player1+=2;
            
        await existing_game[0].save();
      
        await userno1.save();
      
        game.card1="empty"
      
        game.card2="empty"

        game.card1played = false

        game.card2played = false
      
        await game.save()
      
        return game.user1
      
      }
      
      else if(winner === 2){  //user1 defeated
        

        const userno2= await this.user.findOne().where('username').equals(user2).exec();
      
        game=await this.passkey.findOne().where('gameid').equals(gameid).exec()
      
        game.playerWin.push(game.user2)
      
        console.log(user1+" is defeated ")
      
        userno2.stars+= 2  //here stars are removed from admin account also

        let existing_game =  await this.match.find({gameid:gameid})

				existing_game[0].stars_of_player2+=2;
            
        await existing_game[0].save();

        await userno2.save();
      
        game.card1="empty"
      
        game.card2="empty"

        
       game.card1played = false

       game.card2played = false
      
        await game.save()
      
        return game.user2
      
      }

      existing_game[0].stars_of_player1+=1;

      existing_game[0].stars_of_player1+=1;

      const userno1= await this.user.findOne().where('username').equals(user1).exec();

      const userno2= await this.user.findOne().where('username').equals(user2).exec();

      userno1.stars++;

      userno2.stars++;

      await userno1.save();

      await userno2.save();

      await existing_game[0].save();

      game.playerWin.push("tie")

       await game.save();
      
       game.card1="empty"    
   
       game.card2="empty"

       game.card1played = false

       game.card2played = false
      
       await game.save()
      
       return "game is draw"
     
    }

  catch(err){
    throw new BadRequestException(err.message)
  }
        
          
        
       
        
}
}
