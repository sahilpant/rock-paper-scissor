
import { SubscribeMessage, OnGatewayConnection, OnGatewayInit, WebSocketServer, WebSocketGateway ,WsResponse} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import {v4 as uuid} from 'uuid'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import {CardStatus} from './required/cards.enum'
import { passkey } from './required/interfaces/passkey.interface';
import { PlayService } from './play/play.service';
import {jwtStrategy} from './jwt.strategy'
import * as jwt from 'jsonwebtoken';
import {JwtPayLoad} from './required/interfaces/jwt-payload.interface'
import { detailOfCard, show_stars, total_cards, transferstar} from '.././gameblock'
import { ConfigService } from '@nestjs/config';
import { AppGateway } from './app.gateway'
import { NotificationService } from './notification/notification.service';
import { match } from './required/interfaces/match.interface';
import { request } from './required/interfaces/request.interface';
import { object } from '@hapi/joi';
import { networkInterfaces } from 'os';
import { matches } from 'class-validator';

@WebSocketGateway({namespace:'/game'})
export class TestGateway implements OnGatewayInit, OnGatewayConnection{
	check: any;
	users: any;

	Clients =[];
	NotificationService: any;
	clients: any;
  
 
  constructor(
              
              private jwtstrategy:jwtStrategy,
              
              @InjectModel('user')  private readonly user:Model<user>,
              
			  @InjectModel('passkey') private readonly passkey:Model<passkey>,

			  @InjectModel('match') private readonly match:Model<match>,

			  @InjectModel('request') private readonly request:Model<request>,
              
			  private readonly playservice:PlayService,
			  
			  private configservice: ConfigService,
			   ){}

  private logger:Logger = new Logger('TestGateway');

  public room_invite_flag = {} //room id -> TRUE || FALSE
  
  @WebSocketServer() wss:Server;
  
	async  afterInit(server: Server) {

    	this.logger.log(`initialised`);
  
	  }
	  
//  handle connection event

  async handleConnection(client:Socket) {
	
    if(client.handshake.query.token){
		var data = client.handshake.query.token
		try{
			const ans = <JwtPayLoad>jwt.verify(data,this.configservice.get<string>('JWT_SECRET'))
			let isuserValidatedwithPlayload = await this.jwtstrategy.validate(ans)
			if(isuserValidatedwithPlayload) {
				// client.id= isuserValidatedwithPlayload.username;
				
				var clientInfo = {
					clientID :client.id,
					username:isuserValidatedwithPlayload.username
				}
            //    console.log(clientInfo.username)
			this.Clients =	this.Clients.filter(function(id){
                         return id.username != clientInfo.username
				})

				this.Clients.push(clientInfo);
				// console.log(this.Clients);

				client.emit('Connection',isuserValidatedwithPlayload) //in the browser console this output will be showm
			}

			else{
				console.log("invalid token")
				client.emit('Connection',"invalid_token")
				
			}
		}
		catch(err){

		  	const message = 'Token error- ' + err.message
			client.emit('Connection', message);
			// throw new HttpException(message, HttpStatus.FORBIDDEN)
		}
		


	}
  else{

	client.emit('Connection', "missing_token")
	client.disconnect()
  }
  }


		





async finalResult(gameid:string)
{

	
	var existing_game = await this.match.find({gameid:gameid})
					
	let gameINDB = await this.passkey.findOne({gameid:gameid})

	let db_user1 = await this.user.findOne({username:gameINDB.user1});
	let db_user2 = await this.user.findOne({username:gameINDB.user2});

	if(gameINDB.playerWin.length !== 0)
	{
		let match_details = await this.match.findOne({gameid:gameid});					
		let user1name  = gameINDB.user1;
		let user2name  = gameINDB.user2;

		let user1 = 0, user2 = 0, draw = 0;
		
		for(const player in gameINDB.playerWin)
		{
			if(gameINDB.playerWin[player] === user1name)
			user1++;  

			else if(gameINDB.playerWin[player] === user2name)
			user2++;

			else
			draw++;
		}

		const finalPlayerWon = (user1>user2)?user1name:((user2>user1)?user2name:"DRAW");
		existing_game[0].winner = finalPlayerWon;
		existing_game[0].status = "Completed";
		
		db_user1.stars += match_details.stars_of_player1;
		db_user2.stars += match_details.stars_of_player2;

		await db_user1.save();
		await db_user2.save();

		this.wss.to(gameid).emit(`Final Result after Round${gameINDB.playerWin.length} `,finalPlayerWon);			
		await gameINDB.deleteOne();		
		await existing_game[0].save()				
	}
	else if(gameINDB)
	{
		this.wss.to(gameid).emit('game not played',"not a single game has been played to display the final result");
		await gameINDB.deleteOne();
	}
					
}



@SubscribeMessage('roundetails')
async deletepasskey(client:Socket,obj:Object){
	var data = obj.gameid;
	var roundetails = await this.passkey.findOne({"gameid":data},{});

	let response = {
		"player1":roundetails.card1played,
		"P1_position":roundetails.user1,
		"player2":roundetails.card2played,
		"P2_position":roundetails.user2
	}
	client.emit("roundetails_response", response)
	
}


@SubscribeMessage('move')
async playGame(client:Socket,obj:Object)
{
	var data = obj.card_number;
    var cardindex = obj.card_position;	
	let gameExistinPasskey = await this.passkey.findOne({gameid:obj.gameid});  // Fetch details from db
	let gameExistinMatch = await this.match.findOne({gameid:obj.gameid}); // fetch match detials from db
	
	// console.log(gameExistinPasskey);
	// If passkey collection is empty against this gameid then insert this match instance in the collection
if(gameExistinMatch.status == "active"){
	if(gameExistinPasskey == null){
		
	// client.to(obj.gameid).emit("move_response", gameExistinPasskey);
	//  Storing data in passkey collection
	let passkeyObj = new this.passkey({		
	player1address:gameExistinMatch.player1.publicaddress,
    player2address:gameExistinMatch.player2.publicaddress,
    client1id: gameExistinMatch.player1.username,
    client2id:gameExistinMatch.player2.username,
    token1:0,
    token2:0,
    gameid:gameExistinMatch.gameid,
    card1:null,
    card2:null,
    user1: null,
    user2:null,
    moves:[],
    playerWin:null,
    card1played:false,
    card2played:false
	});
	
	await passkeyObj.save(); // Save function is called here
	// Saving passkey in this collection - Ends here
     if(gameExistinMatch && obj.username == gameExistinMatch.player1.username){
		let new_arr = gameExistinMatch.player1cardposition;
		if(new_arr[cardindex] == false)
		new_arr[cardindex] = true;
		await this.match.updateOne({gameid:obj.gameid},{$set:{player1cardposition:new_arr}})
		await this.passkey.updateOne({gameid:obj.gameid}, {$set:{token1:obj.card_number,card2played:true,user1:obj.card_position}});
		await this.user.update({"username":obj.username},{
			$pull:{notUsedCards:obj.card_number
			},
			$push:{ usedCards:obj.card_number}
		})
           
	 }
	 else if (gameExistinMatch && obj.username == gameExistinMatch.player2.username){ 
		let new_arr = gameExistinMatch.player2cardposition;
		if(new_arr[cardindex] == false)
		new_arr[cardindex] = true;
		await this.match.updateOne({gameid:obj.gameid},{$set:{player2cardposition:new_arr}})
		await this.passkey.updateOne({gameid:obj.gameid}, {$set:{token2:obj.card_number, card2played:true, user2:obj.card_position}});
		await this.user.update({"username":obj.username},{
			$pull:{notUsedCards:obj.card_number
			},
			$push:{ usedCards:obj.card_number}
		})
	}
}

// Add to passkey if passkey object exists

if(gameExistinPasskey && gameExistinMatch){


if(gameExistinPasskey && gameExistinMatch && obj.username == gameExistinMatch.player1.username && gameExistinPasskey.token1 == 0){
	let new_arr = gameExistinMatch.player1cardposition;
	if(new_arr[cardindex] == false)
	new_arr[cardindex] = true;
	await this.match.updateOne({gameid:obj.gameid},{$set:{player1cardposition:new_arr}})	
	await this.passkey.updateOne({gameid:obj.gameid}, {$set:{token1:obj.card_number,card1played:true,user1:obj.card_position}});
	// console.log( await this.passkey.find({gameid:obj.gameid}))
	await this.user.update({"username":obj.username},{
		$pull:{notUsedCards:obj.card_number
		},
		$push:{ usedCards:obj.card_number}
	})
}

else if(gameExistinPasskey && gameExistinMatch && obj.username == gameExistinMatch.player2.username && gameExistinPasskey.token2 == 0){ 
	let new_arr = gameExistinMatch.player2cardposition;
	if(new_arr[cardindex] == false)
	new_arr[cardindex] = true;
	await this.match.updateOne({gameid:obj.gameid},{$set:{player2cardposition:new_arr}})
	await this.passkey.updateOne({gameid:obj.gameid}, {$set:{token2:obj.card_number, card2played:true,user2:obj.card_position}});
	await this.user.update({"username":obj.username},{
		$pull:{notUsedCards:obj.card_number
		},
		$push:{ usedCards:obj.card_number}
	})
}
else{

	// Rectify this
	if(gameExistinPasskey){
		client.emit("move_response","You already made your move")
	}
	
}
}
// Ends

// console.log(gameExistinMatch,gameExistinPasskey,gameExistinPasskey.token1,gameExistinPasskey.token2);

if(gameExistinPasskey !== null && gameExistinMatch !== null){
	// console.log("Entered in first loop")
	
	gameExistinPasskey = await this.passkey.findOne({gameid:obj.gameid});  // Fetch details from db

if(gameExistinPasskey !== null && gameExistinMatch !== null && gameExistinPasskey.token1 > 0 && gameExistinPasskey.token2 > 0){
	// console.log("I was here");
	// console.log("Entered in second loop")

	for (var i = 0; i <= 1 ; i++){
		let carddetail: string | string[];
		let givenCardType;
		console.log(i);
		if(i == 0){

			carddetail = await detailOfCard(gameExistinPasskey.token1);
			(carddetail[0] === "1")?(givenCardType="ROCK"):(
				(carddetail[0] === "2")?(givenCardType="PAPER"):(
													(carddetail[0] === "3")?(givenCardType = "SCISSOR"):givenCardType="none"))
		
													await this.passkey.updateOne({gameid:obj.gameid}, {$set:{card1:givenCardType}});
		}
		else{
			carddetail = await detailOfCard(gameExistinPasskey.token2);
			
			(carddetail[0] === "1")?(givenCardType="ROCK"):(
				(carddetail[0] === "2")?(givenCardType="PAPER"):(
													(carddetail[0] === "3")?(givenCardType = "SCISSOR"):givenCardType="none"))
		
													await this.passkey.updateOne({gameid:obj.gameid}, {$set:{card2:givenCardType}});
		}												
		
	}

	//  Winner of round : Starts
	var dat = obj.gameid;
 let gamedetails = await this.passkey.find({"gameid":obj.gameid});
//  console.log(gamedetails);
switch (gamedetails[0].card1)
{
	case 'ROCK':
		console.log(gamedetails[0].card2);
		switch (gamedetails[0].card2)
		{
			case 'ROCK': 
			await this.handletransfers(0,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
			this.wss.to(obj.gameid).emit("round_results","Tie");
			break;
			case 'PAPER':
			await this.handletransfers(2,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
			this.wss.to(obj.gameid).emit("round_results",gamedetails[0].client2id);
			break;
			case 'SCISSOR':
				await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
				this.wss.to(obj.gameid).emit("round_results",gamedetails[0].client1id);
				break;		

		}break;
	case 'PAPER':
		console.log(gamedetails[0].card2);
		switch (gamedetails[0].card2)
		{
			case 'ROCK': 
			await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
			this.wss.to(obj.gameid).emit("round_results",gamedetails[0].client1id);
			break;
			case 'PAPER':
				await this.handletransfers(0,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
			this.wss.to(obj.gameid).emit("round_results","Tie");
			break;
			case 'SCISSOR':
				await this.handletransfers(2,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
				this.wss.to(obj.gameid).emit("round_results",gamedetails[0].client2id);	
				break;
			default:
			break;
		} break;

		case 'SCISSOR':
			console.log(gamedetails[0].card2);
			switch (gamedetails[0].card2)
			{
				case 'ROCK':
					await this.handletransfers(2,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
				this.wss.to(obj.gameid).emit("round_results",gamedetails[0].client2id);
				break;
				case 'PAPER':
				await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
				this.wss.to(obj.gameid).emit("round_results",gamedetails[0].client1id);
				break;
				case 'SCISSOR':
					await this.handletransfers(0,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
					this.wss.to(obj.gameid).emit("round_results","Tie");	
				default:
					break;
	
			}break;
			default:
			break;
}
	// Winner of round: Ends
	
}
}

this.wss.to(obj.gameid).emit("move_response",{"gameid":obj.gameid,"card_position":obj.card_position, "username":obj.username});

}
else{
	this.wss.to(obj.gameid).emit("move_response","Invalid game");
}
}


// Function to update match details and sending response.
async handletransfers(winner,card1,card2,token1,token2,game):Promise<any>{

console.log(winner,card1,card2,token1,token2,game)
let gameblock = await this.match.find({gameid:game},{});
console.log(gameblock)

if(winner == 1){
	gameblock[0].stars_of_player2--;
	gameblock[0].stars_of_player1++
}
else if(winner == 2){
	gameblock[0].stars_of_player2++;
	gameblock[0].stars_of_player1--;
}
//  console.log(gameblock[0]);
 gameblock[0].round++;
 if(gameblock){
gameblock[0].Rounds.push({
	player1:{
			card_type:card1,
			card_number:token1,
			timestamp:new Date()
		},
		player2:{
			card_type:card2,
			card_number:token2,
			timestamp:new Date()
		}

})}

if(gameblock[0].round == 3 || gameblock[0].stars_of_player1 == 0 || gameblock[0].stars_of_player2 == 0){
	gameblock[0].status = "COMPLETED";
	if(gameblock[0].stars_of_player1 > gameblock[0].stars_of_player2){
        gameblock[0].winner = "1";
	}
	else if(gameblock[0].stars_of_player2 > gameblock[0].stars_of_player1){
        gameblock[0].winner = "2";
	}
	else{
		gameblock[0].winner ="0";
	}
	// Final settlement of stars on blockchain
	console.log("Stars of player 2 ***********************************************")
	console.log(gameblock[0].stars_of_player2);
	if(gameblock[0].stars_of_player1 > 0 && gameblock[0].player1.publicaddress !== null){
		console.log(`Stars of Player one + ${gameblock[0].stars_of_player1}`);
		await transferstar(gameblock[0].player1.publicaddress,gameblock[0].stars_of_player1);
		await this.user.updateOne({publickey:gameblock[0].player1.publicaddress},{$inc:{
			stars:gameblock[0].stars_of_player1
		}})
	}
 if(gameblock[0].stars_of_player2 > 0 && gameblock[0].player2.publicaddress !== null){
	console.log(`Stars of Player two + ${gameblock[0].stars_of_player2}`);
	await transferstar(gameblock[0].player2.publicaddress,gameblock[0].stars_of_player2);
	await this.user.updateOne({publickey:gameblock[0].player2.publicaddress},{$inc:{
		stars:gameblock[0].stars_of_player2
	}})
}
}

await this.passkey.updateOne({gameid:game},{$set:{
	token1:0,
	token2:0,
	card1:null,
	card2:null,
	user1:null,
	user2:null,
	card1played:false,
	card2played:false

}})
await gameblock[0].save();
return "1"
}
		
	@SubscribeMessage('chat')
	handlechat(client: Socket, data: string):void 
	{
                     
				const room = data;
				console.log(room);
				client.join(room);
				this.wss.to(room).emit('chat_response', data);
	}
  
	// EndGame starts here

	@SubscribeMessage('End_Game')
	async handleEndGame(client:Socket,obj:Object) {
		const _room = obj.gameid;
		//DB access
		
		const game = await this.passkey.findOne().where('gameid').equals(_room).exec();
		const match_details = await this.match.find({gameid:_room});
		console.log(game);
		console.log(match_details);		
 		if(game && (game.player1address  || game.player2address) && match_details[0].status == "active"){
	   
			if(game.card1played == true || game.card2played == true){
				// Player has to forefit card and loose one star
				if(game.card1played == true && obj.publickey == game.player1address){
					// Deduct one star from player1 address
console.log(match_details[0]);					
match_details[0].round++;
 if(match_details){
	match_details[0].Rounds.push({
	player1:{
			card_type:game[0].card1,
			card_number:game[0].token1,
			timestamp:new Date()
		},
		player2:{
			card_type:"NA",
			card_number:0,
			timestamp:new Date()
		}

})}

match_details[0].status = "aborted";
match_details[0].winner = "4";
match_details[0].stars_of_player1--;
match_details[0].stars_of_player2++;
await this.passkey.updateOne({gameid:obj.gameid},{$set:{
	token1:0,
	token2:0,
	card1:null,
	card2:null,
	user1:null,
	user2:null,
	card1played:false,
	card2played:false

}})

await transferstar(match_details[0].player2.publicaddress,match_details[0].stars_of_player1);
await this.user.updateOne({publickey:match_details[0].player2.publicaddress},{$inc:{
	stars:match_details[0].stars_of_player2

}})

await transferstar(match_details[0].player1.publicaddress,match_details[0].stars_of_player1);
await this.user.updateOne({publickey:match_details[0].player1.publicaddress},{$inc:{
	stars:match_details[0].stars_of_player1,
	cardDebt:1
}})

await match_details[0].save();
this.wss.to(obj.gameid).emit("End_Game_response","Aborted");
	}
				else if(game.card1played = true && obj.publickey == game.player2address){
					// Deduct one star from player2 address and set card played as None

					match_details[0].round++;
 if(match_details){
	match_details[0].Rounds.push({
	player1:{
			card_type:game.card1,
			card_number:game.token1,
			timestamp:new Date()
		},
		player2:{
			card_type:"NA",
			card_number:0,
			timestamp:new Date()
		}

})}

match_details[0].status = "aborted",
match_details[0].winner = "4",
match_details[0].stars_of_player1++,
match_details[0].stars_of_player2--
await this.passkey.updateOne({gameid:obj.gameid},{$set:{
	token1:0,
	token2:0,
	card1:null,
	card2:null,
	user1:null,
	user2:null,
	card1played:false,
	card2played:false

}})

await transferstar(match_details[0].player2.publicaddress,match_details[0].stars_of_player1);
await this.user.updateOne({publickey:match_details[0].player2.publicaddress},{$inc:{
	stars:match_details[0].stars_of_player2,
	cardDebt:1
}})

await transferstar(match_details[0].player1.publicaddress,match_details[0].stars_of_player1);
await this.user.updateOne({publickey:match_details[0].player1.publicaddress},{$inc:{
	stars:match_details[0].stars_of_player1
}})

await match_details[0].save();
this.wss.to(obj.gameid).emit("End_Game_response","Aborted");


				} else if(game.card2played == true && obj.publickey == game.player2address ){
					// deduct one star from player2 and add it to player 1
					match_details[0].round++;
					if(match_details){
					   match_details[0].Rounds.push({
					   player1:{
							   card_type:"NA",
							   card_number:0,
							   timestamp:new Date()
						   },
						   player2:{
							   card_type:game.card2,
							   card_number:game.token2,
							   timestamp:new Date()
						   }
				   
				   })}
				   
				   match_details[0].status = "Aborted",
				   match_details[0].winner = "4",
				   match_details[0].stars_of_player1++,
				   match_details[0].stars_of_player2--
				   await this.passkey.updateOne({gameid:obj.gameid},{$set:{
					   token1:0,
					   token2:0,
					   card1:null,
					   card2:null,
					   user1:null,
					   user2:null,
					   card1played:false,
					   card2played:false
				   
				   }})

				   await transferstar(match_details[0].player2.publicaddress,match_details[0].stars_of_player1);
					   await this.user.updateOne({publickey:match_details[0].player2.publicaddress},{$inc:{
						   stars:match_details[0].stars_of_player2,
						   cardDebt:1
					   }})
				   
					   await transferstar(match_details[0].player1.publicaddress,match_details[0].stars_of_player1);
					   await this.user.updateOne({publickey:match_details[0].player1.publicaddress},{$inc:{
						   stars:match_details[0].stars_of_player1,
						   
					   }})
				   
				   await match_details[0].save();
				   this.wss.to(obj.gameid).emit("End_Game_response","Aborted");
				}
				else {
					// deduct one star from player 1 address and add none
					match_details[0].round++;
					if(match_details){
					   match_details[0].Rounds.push({
					   player1:{
							   card_type:"NA",
							   card_number:0,
							   timestamp:new Date()
						   },
						   player2:{
							   card_type:game.card2,
							   card_number:game.token2,
							   timestamp:new Date()
						   }
				   
				   })}
				   
				   match_details[0].status = "aborted",
				   match_details[0].winner = "4",
				   match_details[0].stars_of_player1--,
				   match_details[0].stars_of_player2++
				   await this.passkey.updateOne({gameid:obj.gameid},{$set:{
					   token1:0,
					   token2:0,
					   card1:null,
					   card2:null,
					   user1:null,
					   user2:null,
					   card1played:false,
					   card2played:false
				   
				   }})
				   
				   await transferstar(match_details[0].player2.publicaddress,match_details[0].stars_of_player1);
					   await this.user.updateOne({publickey:match_details[0].player2.publicaddress},{$inc:{
						   stars:match_details[0].stars_of_player2,
					   }})
				   
					   await transferstar(match_details[0].player1.publicaddress,match_details[0].stars_of_player1);
					   await this.user.updateOne({publickey:match_details[0].player1.publicaddress},{$inc:{
						   stars:match_details[0].stars_of_player1,
						   cardDebt:1
					   }})
				   
				   await match_details[0].save();

                   this.clients.emit("End_Game_response","Aborted")
				   this.wss.to(obj.gameid).emit("End_Game_response","Aborted");
				}


			}
			else{
				// Settle the game at the current status
			}
			
			

		}

		else if(!game && match_details[0].status == 'waiting'){

		match_details[0].status="Aborted";
		match_details[0].stars_of_player1--;  
	    await transferstar(match_details[0].player1.publicaddress,match_details[0].stars_of_player1);
					   await this.user.updateOne({publickey:match_details[0].player1.publicaddress},{$inc:{
						stars:match_details[0].stars_of_player1,
						cardDebt:1
					   }})
		await match_details[0].save();
		this.wss.to(obj.gameid).emit("End_Game_response","Aborted");				   
		// this.leave_match(client,obj);
		}
		else{
			if(obj.publickey ==  match_details[0].player1.publicaddress && match_details[0].status == 'active'){
				match_details[0].status="Aborted";
				match_details[0].stars_of_player1--;
				await transferstar(match_details[0].player1.publicaddress,match_details[0].stars_of_player1);
					   await this.user.updateOne({publickey:match_details[0].player1.publicaddress},{$inc:{
						stars:match_details[0].stars_of_player1,
						cardDebt:1
					   }})
		        await match_details[0].save();
                this.wss.to(obj.gameid).emit("End_Game_response","Aborted");
			}
			else  if(obj.publickey ==  match_details[0].player2.publicaddress && match_details[0].status == 'active'){
				match_details[0].status="Aborted";
				match_details[0].stars_of_player2--;
				await transferstar(match_details[0].player2.publicaddress,match_details[0].stars_of_player2);
					   await this.user.updateOne({publickey:match_details[0].player2.publicaddress},{$inc:{
						stars:match_details[0].stars_of_player2,
						cardDebt:1
					   }})
		        await match_details[0].save();
                this.wss.to(obj.gameid).emit("End_Game_response","Aborted");   
			}
			else{
				
				this.wss.to(obj.gameid).emit("End_Game_response","Aborted");
			}
		}
	}

	// End game Ends Here


	@SubscribeMessage('Message')
	async messageclient(client:Socket, data:string){
		   
		console.log(client.id)
		client.emit('listen', "this is the data");

	}


    @SubscribeMessage('invite')
	sendInvite(client: Socket,obj:Object){
		const room = obj.roomID;
		client.emit("Success",`Invitation sent to ${obj.email}`);
		this.NotificationService.send_room_code(obj.email,room);
	}	
		
		@SubscribeMessage('joinGameByInvite')
		async joinGame_throughInvite(client: Socket,data:Object) {
	
			var token = data.jwt_token;
			try{
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'))  
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			console.log(userdetails.publickey);
			
			if(userdetails.publickey){
	
				var stars = await show_stars(userdetails.publickey);
				var card_details = await total_cards(userdetails.publickey);					
						
			}
						
			var existing_game = await  this.match.find({gameid:data.gameid});
									
			if(existing_game.length > 0  && this.room_invite_flag[`${data.gameid}`]){
	
			
				if(stars>=3){
					stars = stars-3;
					await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':3,'player_joined':2,"status":"active"}}, function(err,data){
						if( err) console.log(err)
					})
				}
				else if(stars<3 && stars>0){
					await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':stars,'player_joined':2,"status":"active"}}, function(err,data){
						if( err) console.log(err)
					})
				}

						
		
	
			var response = await this.match.findOne().where('gameid').equals(existing_game[0].gameid).exec()
	
			client.emit("new_match_response", response);
					
		}
						
	
			
			
		  }
		  
		  catch{
						
			console.log("Invalid user") // Later pass this as event back to client
			client.emit("new_match_response", "Invalid user");
		}
		
	}	

@SubscribeMessage('Public')
async startpublicgame(client:Socket, data:Object):Promise<any>{
				
	var token = data.jwt_token;
	let generated_gameid:any;
    try{
		
		const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'))  
		let userdetails = await this.jwtstrategy.validate(decryptedvalue);
		
		if(userdetails.publickey){
			var stars = await show_stars(userdetails.publickey);
		    var card_details = await total_cards(userdetails.publickey);					
					
		}

		
					
		var existing_game = await  this.match.find({$and:[

			{'player1.username':{$ne:userdetails.username}},
			{'player2.username':null},
			{'status':{$ne:"Aborted"}},
				
		]})					
		
		if(existing_game.length > 0 && !this.room_invite_flag[`${existing_game[0].gameid}`]){

		
			if(stars>=3 && card_details>0){			
				await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':3,'player_joined':2,"status":"active",start_date: null,}}, function(err,data){
					if( err) console.log(err)
				})
			}
			else if(stars < 3 && stars>0 && card_details >0){
			
				await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':stars,'player_joined':2,"status":"active",start_date: null,}}, function(err,data){
					if( err) console.log(err)
				})
			}
			else
			{
					//This is client2's first game
		            client.disconnect();
			}
					
		var response = await this.match.findOne().where('gameid').equals(existing_game[0].gameid).exec()

		client.emit("new_match_response", response);
				
	}
					
	else if( stars > 0 &&  card_details >0 ){
		console.log("running");

		if(stars>=3){
			console.log("running1");
							
			const match = new this.match({
								gameid:uuid(),
								match_type:data.match_type,
								GameLength: data.match_type =='short' ? 60:129600,
								stars_of_player1:3,
								stars_of_player2:0,
								TotalRounds:3,
								start_date: null,
								round:0,
								player1:{
									username: data.username,
									publicaddress:data.publickey,
								},
								player2:{
									username:null,
									publicaddress:null
								},
								Rounds:[],
								status:"waiting",
								winner:""
							})

			generated_gameid = match.gameid;
			await match.save();

			client.emit("new_match_response", match);
		}
		else{
			const match = new this.match({
								gameid:uuid(),
								match_type:data.match_type,
								class:'public',
								stars_of_player1:stars,
								stars_of_player2:0,
								start_date: null,
								TotalRounds:3,
								GameLength: data.match_type =='short' ? 60:129600,
								round:0,
								player1:{
									username: data.username,
									publicaddress:data.publickey,
								},
								player2:{
									username:null,
									publicaddress:null
								},
								Rounds:[],
								status:"waiting",
								winner:""
							}
							)

							generated_gameid = match.gameid;
				
							await match.save(async function(err,data){

								if (err) return "Error while creating match";
		
								else {

									await this.user.updateOne({"username":object.username}, {$set:{stars:0}}, function(err,res){
										if(err){
											console.log(err)
										}
										else{
											
										}
									})
									client.emit("new_match_response", data);
								}
							});

						}					 
						}
						
               
				}
				catch(err){
					console.log(err);
					console.log("Invalid user") // Later pass this as event back to client
					client.emit("new_match_response", "Invalid user");
				}
				return generated_gameid;
			}
		
		// Joinn public game ends here
		 
		@SubscribeMessage('fetch_match_details')
		async getmatchdetails(client:Socket, data:Object){
			var token = data.jwt_token; 
            console.log(data)
			try{
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'))  
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			if(userdetails){

			var response = await this.match.find({$or:[
					{'player1.username':userdetails.username},
					 {'player2.username':userdetails.username}
				]})

				client.emit('match_details',response)
			}
			  }  
			catch{
				var res ={
					response:401,
					message:"Invalid User"
				}
                client.emit('match_details',res)
			}      


		}

		// Join the game play starts here
		@SubscribeMessage('start_match')
 		async start_match(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			
			try{
			if(userdetails){
				let matchinDB =  await this.match.findOne({gameid:data.gameid});
				let userinDB  =  await this.user.findOne({username:data.username}); 
				   var room= data.gameid;


					client.join(room, async function(err){
						if(err) throw err;
						else {
                              console.log(matchinDB);
							if(matchinDB && userinDB && matchinDB.player2.username == data.username && matchinDB.start_date == null ){
								matchinDB.start_date = new Date();
								await matchinDB.save();
							}

					  }
			 });
			 var  matchresponse={
				"username":data.username,
				"timestamp": new Date(),
				"gameid":data.gameid,
				"response":200

			}
			this.wss.to(room).emit('start_match_response', matchresponse);
					// client.emit('start_match_response',matchresponse);
                    
				}
			}
			catch{

				var res ={
				
					response:401,
					message:"Invalid User"
				} 
                client.emit('start_match_response',res)

			}

		}

		@SubscribeMessage('enter_match')
 		async enter_match(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			
			try{
			if(userdetails){
				let matchinDB =  await this.match.findOne({gameid:data.gameid});
				let userinDB  =  await this.user.findOne({username:data.username}); 
				   var room= data.gameid;
					client.join(room, async function(err){
						if(err) throw err;
			 });
			 var  matchresponse={
				"username":data.username,
				"timestamp": new Date(),
				"gameid":data.gameid,
				"response":200

			}
			this.wss.to(room).emit('enter_match_response', matchresponse);
					// client.emit('start_match_response',matchresponse);
                    
				}
			}
			catch{

				var res ={
				
					response:401,
					message:"Invalid User"
				} 
                client.emit('enter_match_response',res)

			}

		}

		@SubscribeMessage("activerooms")
        async activerooms(client:Socket, data:Object){
				
				var roo = data.gameid;
				console.log(client.rooms);

				client.emit('activerooms_response', "This is the message");
		}
		@SubscribeMessage("getroomID")
        async getroomID(client:Socket, data:Object){
				
				console.log(client.rooms);
				var room = client.rooms;
				console.log("Above are the rooms");
				client.emit('getroomID_response', room)
		}

		handleNotification(id:string){

			this.wss.to(id).emit('Notification','What is Up?');

		}
		@SubscribeMessage('leave_match')
 		async leave_match(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			try{
				client.leave(data.gameid, async () =>{
					client.emit('leave_match_response', `${data.username} left room ${data.gameid}`)
				})
			}
			catch{

				var res ={
					
					response:401,
					message:"Invalid User"
				}
                client.emit('leave_match_response',res)

			}
		 }

		 @SubscribeMessage('room_check')
		  roomcheck(client:Socket, data:string):WsResponse<unknown>{
			 console.log("asdfghjkl");
			 
			 
			client.join(data);

			 console.log(Object.keys(client.rooms));
			 
			this.wss.to(data).emit('room_check_response', {room: 'aRoomwww'});
			this.wss.to(Object.keys(client.rooms)[0]).emit('room_check_response', {room: 'aRoom'});

			return ;
			// socket.to('aRoom').emit('roomCreated', {room: 'aRoom'});
		 }


		 @SubscribeMessage('server_time')
		 async servertime(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			if(userdetails){
				
				var res={
					response:201,
					date:new Date(),


				}
				client.emit('server_time_response', res);
			}
			else{
				var err={
					response:401,
					date:""

				}
				client.emit('server_time_response', err);
			}

		 }

		//  Create Private Match -  Starts

		 @SubscribeMessage('private')
		 async Joinprivate(client: Socket, data:Object) {
			 var token = data.jwt_token;
			 console.log("private was called");
			 const decryptedvalue =  <JwtPayLoad>jwt.verify(token, this.configservice.get<string>('JWT_SECRET'));
			 let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			 if(userdetails){
				try{
					if(userdetails.publickey){
						var stars = await show_stars(userdetails.publickey);
						var card_details = await total_cards(userdetails.publickey)								
					}
								
				 if( stars > 0 &&  card_details >0 ){
					if(stars>=3){
								console.log("here")		 
						const match = new this.match({
											gameid:uuid(),
											class:'private',
											match_type:data.match_type,
											GameLength: data.match_type =='short' ? 60:129600,
											stars_of_player1:3,
											stars_of_player2:0,
											TotalRounds:3,
											start_date: new Date(),
											round:0,
											player1:{
												username: data.username,
												publicaddress:data.publickey,
											},
											player2:{
												username:data.palyer2,
												publicaddress:data.address2
											},
											Rounds:[],
											status:"waiting confirmation",
											winner:""
										})
			
						var generated_gameid = match.gameid;
						await match.save();
						
						const request = new this.request({
							gameid:generated_gameid,
							host:data.username,
							invitee:data.palyer2,
							lastUpdated:new Date(),
							status:"pending"

						})

						await request.save();
						let index = this.Clients.map(function(e) { return e.username; }).indexOf(data.palyer2);
						// let index = this.Clients.indexOf(data.palyer2)
						console.log(index);
						console.log(data.palyer2);
						console.log(this.Clients[index].clientID);
						// Fetch the gameID for Notification
						// var notification ={
						// 	gameid:"",  // Add game ID
						// 	host:data.username,
						// guest:
						// action:  0 - for request and 1 for acceptance , 2 - for decline
						     

						// }
						this.wss.to(this.Clients[index].clientID).emit("private_game_notification", `Match request from ${data.username}`)
						client.emit("private_response", data);
						
					
					}
					else{
			
						const match = new this.match({
											gameid:uuid(),
											match_type:data.match_type,
											class:'private',
											stars_of_player1:stars,
											stars_of_player2:0,
											start_date: new Date(),
											TotalRounds:3,
											GameLength: data.match_type =='short' ? 60:129600,
											round:0,
											player1:{
												username: data.username,
												publicaddress:data.publickey,
											},
											player2:{
												username:data.palyer2,
												publicaddress:data.address2
											},
											Rounds:[],
											status:"waiting confirmation",
											winner:""
										}
										)
			
										generated_gameid = match.gameid;							
										await match.save();
										console.log("This is called 2");
										console
										const request = new this.request({
											gameid:generated_gameid,
											host:data.username,
											invitee:data.palyer2,
											lastUpdated:new Date(),
											status:"pending"
				
										});
										await request.save();
										client.emit("private_response", data);
			
									}					 
									}
							}
			 catch{
				client.emit("private_response", "Error while creating match");
			 }

			}
			else{
				client.emit("private_response", data);
			}

		 }
		//  Create Private match - Ends



		//Private Match request starts
		

		@SubscribeMessage('pending_match_request')
		async privatematchrequest(client:Socket, data:Object){
			var token = data.jwt_token;
			console.log("private was called");
			const decryptedvalue =  <JwtPayLoad>jwt.verify(token, this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
            console.log(userdetails);
			if(userdetails){
				 
				var response = await this.request.find({$or:[{"host":userdetails.username},
			                                        {"invitee":userdetails.username}]},{})
                client.emit('pending_match_request_response', response);
    
			}
			else{
				client.emit('pending_match_request_response', "Invalid Token")
			}
			}
		//Private Match request Ends

		@SubscribeMessage('invitee_action')
		async hostaction(client:Socket, data:Object){
			var token = data.jwt_token;
			const decryptedvalue =  <JwtPayLoad>jwt.verify(token, this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);

			if(userdetails){

				let detail = await this.request.find({"gameid":data.gameid},{});
				console.log(detail, userdetails.username);
				if(detail[0].invitee == userdetails.username && data.action == 1 && detail[0].status == "waiting confirmation"){
					if(userdetails.publickey){
						var stars = await show_stars(userdetails.publickey);
						var card_details = await total_cards(userdetails.publickey);					
								
					}

					// Updating mathc detials

					if(stars>=3 && card_details>0){
			
						await  this.match.updateOne({gameid:data.gameid},{$set:{'stars_of_player2':3,'player_joined':2,"status":"active"}}, function(err,data){
							if( err) console.log(err)
						})
					}
					else if(stars<3 && stars>0 && card_details>0){
					
						await  this.match.updateOne({gameid:data.gameid},{$set:{'stars_of_player2':stars,'player_joined':2,"status":"active"}}, function(err,data){
							if( err) console.log(err)
						})
					}
					else
					{
							//This is client2's first game
							client.disconnect();
					}

					
				}

				
				await this.request.updateOne({gameid:data.gameid},{$set:{"status":data.action == 1 ? "accepted":"rejected"}});

				client.emit('invitee_action_response', data.action == 1 ? "Request approved":"Request rejected");

			}
			else{
				client.emit('invitee_action_response', "Invalid Token")
			}

		}

	handlejoinFirstTime(client: Socket) {
		throw new Error('Method not implemented.');
	}


	@SubscribeMessage('online_users')
	async liveusers(client:Socket, data:Object){
		var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			if(userdetails){

				client.emit("online_users_response", this.Clients)
			}
			else{
				client.emit("online_users_response", "Invalid User");
			}

	}

		 @SubscribeMessage('logoff')
 		async disconnect(client:Socket, data:Object){
			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			try{
				// client.connected = false;
				this.logger.log(`${client.id} disconnected`);
				client.emit('Disconnect_response',res)
				client.disconnect();
			}
			catch{

				var res ={
					response:401,
					message:"Invalid User"
				}
                client.emit('Disconnect_response',res)

			}
		 }

}