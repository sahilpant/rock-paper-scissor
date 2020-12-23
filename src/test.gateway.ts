
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
import { object } from '@hapi/joi';
import { networkInterfaces } from 'os';

@WebSocketGateway({namespace:'/game'})
export class TestGateway implements OnGatewayInit, OnGatewayConnection{
	check: any;
	users: any;

	Clients =[];
	NotificationService: any;
  
 
  constructor(
              
              private jwtstrategy:jwtStrategy,
              
              @InjectModel('user')  private readonly user:Model<user>,
              
			  @InjectModel('passkey') private readonly passkey:Model<passkey>,

			  @InjectModel('match') private readonly match:Model<match>,
              
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
					username:isuserValidatedwithPlayload.username;
				}

				this.Clients.push(clientInfo);
				console.log(this.Clients);

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


		
	@SubscribeMessage('End_Game')
	async handleEndGame(client:Socket,obj:Object) {
		const _room = obj.gameid;
	

		//DB access

		const game = await this.passkey.findOne().where('gameid').equals(_room).exec();
        const match_details = await this.match.findOne({gameid:_room});

 		if(game && (game.player1address || game.player2address)){

			const user_1 =  await this.user.findOne({publickey:game.player1address});

			const user_2 =  await this.user.findOne({publickey:game.player2address});

			/*---------------------------Card Returning Logic Starts Here-------------------------*/
				
			if(game.card1 && game.card1 !== null){
				let returnedTokenId = user_1.usedCards.pop()

				user_1.notUsedCards.push(returnedTokenId)
			}

			else if(game.card2 && game.card2 !== null){
				let returnedTokenId = user_2.usedCards.pop()

				user_2.notUsedCards.push(returnedTokenId)
			}

			/*-----------------------Card Returning Logic Ends Here-------------------------------*/
					
			/*-----------------------Stars Returning Logic Starts Here-------------------------------*/
				
			if(user_1){
		
				user_1.stars += match_details.stars_of_player1;
				await user_1.save();
			}
			
			if(user_2){
				
				user_2.stars += match_details.stars_of_player2;
				await user_2.save();
			}

			
			await this.finalResult(_room);				
			/*-----------------------Stars Returning Logic ends Here-------------------------------*/
			
				
			await game.deleteOne();
			
			await this.finalResult(obj.gameid);

		
			
			delete this.room_invite_flag[`${_room}`];

			//Blockchain part for star transefer from admin

			client.to(_room).broadcast.emit('End_Game_Response', `${client.id} has ended the Game`);
			client.leave(_room);

		}

		else{
		delete this.room_invite_flag[`${_room}`];
		this.leave_match(client,obj);
		}
	}
	leave_match(client: Socket, obj: Object) {
		throw new Error('Method not implemented.');
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



@SubscribeMessage('DeletePasskey')
async deletepasskey(client:Socket,obj:Object){

	var data = obj.gameid;
	console.log(data);
	console.log(await this.passkey.findOne({"gameid":data},{}));
	// this.passkey.deleteOne({"gameid":data});
}
@SubscribeMessage('move')
async playGame(client:Socket,obj:Object)
{
	var data = obj.card_number;
	
	let gameExistinPasskey = await this.passkey.findOne({gameid:obj.gameid});  // Fetch details from db
	let gameExistinMatch = await this.match.findOne({gameid:obj.gameid}); // fetch match detials from db
	// console.log(gameExistinPasskey);
	// If passkey collection is empty against this gameid then insert this match instance in the collection

	if(gameExistinPasskey == null){
		console.log("It entered in the loop")
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
	// console.log("*********************")
	// console.log(gameExistinMatch.player1.username);
	// console.log(gameExistinMatch.player2.username);
	console.log(obj.username);
     if(gameExistinMatch && obj.username == gameExistinMatch.player1.username){
		
		console.log("Updated for first player")
		await this.passkey.updateOne({gameid:obj.gameid}, {$set:{token1:obj.card_number,card2played:true}});

	 }
	 else if (gameExistinMatch && obj.username == gameExistinMatch.player2.username){ 
		console.log("Updated for second player")
		await this.passkey.updateOne({gameid:obj.gameid}, {$set:{token2:obj.card_number, card2played:true}});
	}
}

// Add to passkey if passkey object exists

if(gameExistinPasskey){
	console.log(true);
}

console.log("*********//////")
console.log(gameExistinPasskey);
console.log("*********//////")
console.log(gameExistinPasskey);


if(gameExistinPasskey && gameExistinMatch){


if(gameExistinPasskey && gameExistinMatch && obj.username == gameExistinMatch.player1.username && gameExistinPasskey.token1 == 0){
	
	await this.passkey.updateOne({gameid:obj.gameid}, {$set:{token1:obj.card_number,card1played:true}});
	// console.log( await this.passkey.find({gameid:obj.gameid}))
}

else if(gameExistinPasskey && gameExistinMatch && obj.username == gameExistinMatch.player2.username && gameExistinPasskey.token2 == 0){ 
	
	await this.passkey.updateOne({gameid:obj.gameid}, {$set:{token2:obj.card_number, card2played:true}});
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
	console.log("Entered in first loop")
	
	gameExistinPasskey = await this.passkey.findOne({gameid:obj.gameid});  // Fetch details from db
	console.log(gameExistinPasskey.token1);
	console.log(gameExistinPasskey.token2);

if(gameExistinPasskey !== null && gameExistinMatch !== null && gameExistinPasskey.token1 > 0 && gameExistinPasskey.token2 > 0){
	// console.log("I was here");
	console.log("Entered in second loop")

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
			await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
			this.wss.to(obj.gameid).emit("move_response","Match tie");
			break;
			case 'PAPER':
			await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
			this.wss.to(obj.gameid).emit("move_response","Player2 win");
			break;
			case 'SCISSOR':
				await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
				this.wss.to(obj.gameid).emit("move_response","Player1 win");
				break;		

		}break;
	case 'PAPER':
		console.log(gamedetails[0].card2);
		switch (gamedetails[0].card2)
		{
			case 'ROCK': 
			console.log(gamedetails[0].card2);
			console.log(4);
			await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
			this.wss.to(obj.gameid).emit("move_response","Player1 win");
			break;
			case 'PAPER':
				await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
			this.wss.to(obj.gameid).emit("move_response","Tie");
			break;
			case 'SCISSOR':
				await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
				this.wss.to(obj.gameid).emit("move_response","Player2 win");	
				break;
			default:
			break;
		} break;

		case 'SCISSOR':
			console.log(gamedetails[0].card2);
			switch (gamedetails[0].card2)
			{
				case 'ROCK':
					await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
				this.wss.to(obj.gameid).emit("move_response","Player2 win");
				break;
				case 'PAPER':
				await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
				this.wss.to(obj.gameid).emit("move_response","Player 1 win");
				break;
				case 'SCISSOR':
					await this.handletransfers(1,gamedetails[0].card1,gamedetails[0].card2,gamedetails[0].token1,gamedetails[0].token2,dat);
					this.wss.to(obj.gameid).emit("move_response","Tie");	
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
	if(gameblock[0].stars_of_player1 > 0 && gameblock[0].player1.publicaddress !== null){
		await transferstar(gameblock[0].player1.publicaddress,gameblock[0].stars_of_player1,gameblock[0].player1.publicaddress);
	}
if(gameblock[0].stars_of_player1 > 0 && gameblock[0].player1.publicaddress !== null){
	await transferstar(gameblock[0].player2.publicaddress,gameblock[0].stars_of_player1,gameblock[0].player2.publicaddress);
}
}

await this.passkey.updateOne({gameid:game},{$set:{
	token1:0,
	token2:0,
	card1:null,
	card2:null
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

    //Join Private game starts here

		@SubscribeMessage('private')
	async handleJoin_with_Friend(client: Socket, data:Object) {

			let game_id = await this.startpublicgame(client,data);
			console.log(game_id);
			this.room_invite_flag[`${game_id}`] = true;
		
	}

// Join Public game starts here  -----  
@SubscribeMessage('Public')
async startpublicgame(client:Socket, data:Object):Promise<any>{
				
	var token = data.jwt_token;
	console.log(token);
	console.log(data);
	let generated_gameid:any;
    try{
		
		const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'))  
		let userdetails = await this.jwtstrategy.validate(decryptedvalue);
		console.log(userdetails);
		console.log(userdetails.publickey);
		
		if(userdetails.publickey){
			var stars = await show_stars(userdetails.publickey);
		    var card_details = await total_cards(userdetails.publickey);					
					
		}

		
					
		var existing_game = await  this.match.find({$and:[

			{'player1.username':{$ne:userdetails.username}},
			{'player2.username':null}
				
		]})
		
		console.log(stars+"  "+card_details+"  "+existing_game.length);					
		
		if(existing_game.length > 0 && !this.room_invite_flag[`${existing_game[0].gameid}`]){

		
			if(stars>=3 && card_details>0){
			
				await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':3,'player_joined':2,"status":"active"}}, function(err,data){
					if( err) console.log(err)
				})
			}
			else if(stars<3 && stars>0 && card_details>0){
			
				await  this.match.updateOne({gameid:existing_game[0].gameid},{$set:{'player2.username': userdetails.username, 'player2.publicaddress':userdetails.publickey,'stars_of_player2':stars,'player_joined':2,"status":"active"}}, function(err,data){
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
								start_date: new Date(),
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
			console.log("748848595885");
			await match.save();
		
		}
		else{

			const match = new this.match({
								gameid:uuid(),
								match_type:data.match_type,
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

							// if(this.room_invite_flag[`${room}`] && data.username === matchinDB.player2.username){
							// 	this.room_invite_flag[`${room}`] = false;
							// }
						  
							if(matchinDB.player1.username === userinDB.username){
								userinDB.stars -= matchinDB.stars_of_player1;
							}
							else if(matchinDB.player2.username === userinDB.username){
								userinDB.stars -= matchinDB.stars_of_player2;
							}
							await userinDB.save();
						
					  

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

		@SubscribeMessage("activerooms")
        async activerooms(client:Socket, data:Object){
				
				var roo = data.gameid;
				console.log(roo);
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

		 @SubscribeMessage('private')
		 async Joinprivate(client: Socket, data:Object) {

			var token = data.jwt_token; 
			console.log(data);
			const decryptedvalue = <JwtPayLoad>jwt.verify(token,this.configservice.get<string>('JWT_SECRET'));
			let userdetails = await this.jwtstrategy.validate(decryptedvalue);
			 if(this.check[client.id]){
				 this.handlejoinFirstTime(client);
				 const room = this.users[client.id];
				 this.room_invite_flag[room] = true;
			 }
			 else{
				 client.emit("Error","invalid_token");
				 client.disconnect();
			 }
		 }
	handlejoinFirstTime(client: Socket) {
		throw new Error('Method not implemented.');
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