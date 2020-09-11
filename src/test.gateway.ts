import { SubscribeMessage, OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect, WebSocketServer, WebSocketGateway ,} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import {v4 as uuid} from 'uuid'
import { AppGateway } from './app.gateway';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { user } from './required/interfaces/user.interface';
import {CardStatus} from './required/cards.enum'
import { passkey } from './required/interfaces/passkey.interface';
import { PlayService } from './play/play.service';
import {jwtStrategy} from './jwt.strategy'
import * as jwt from 'jsonwebtoken'
import {JwtPayLoad} from './required/interfaces/jwt-payload.interface'


@WebSocketGateway({namespace:'/game'})
export class TestGateway implements OnGatewayInit, OnGatewayConnection , OnGatewayDisconnect{
  
 
  constructor(
              private  general:AppGateway,
              
              private jwtstrategy:jwtStrategy,
              
              @InjectModel('user')  private readonly user:Model<user>,
              
              @InjectModel('passkey') private readonly passkey:Model<passkey>,
              
              private readonly playservice:PlayService){}

  private logger:Logger = new Logger('TestGateway');

  private check={}//check whether a client is authorized or not
  
  private currConnected={};//currently connected clients
  
  private noOfusers=1 //to count no of users in game room
  
  private emailOfConnectedUser;//email of users fetched from db using their given accesstoken
  
  private nameOfConnectedUser;//name of users fetched from db using their given accesstoken
  
  private gameCollection={} //{gameid:{userarray:[],timestamp,typeOfGame,status,Moves,RoomName}}
  
  private clientAndUser={}             //{client.id:this.emailofconnecteduser}
  
  private users ={}     // client id:game id

  private custom_id = {}; // client.id : custome_id by uuid()

  private user_timestamp = {};  //client 

  private user_check = {} //client.id : true if user is in a room false if user has left the room

  private room_status = {} //room.id : true if game has been started in that room

  private games = [] // gameid and other user details
  
  @WebSocketServer() wss:Server;
  
  afterInit(server: Server):void {

    this.logger.log(`initialised`);
  
  }


  async handleConnection(client:Socket) {
   
    client.on('handler',async (data)=> 
  
    {
  
      const ans=<JwtPayLoad>jwt.verify(data,'hello')
  
      this.emailOfConnectedUser=ans.email
  
      this.nameOfConnectedUser=ans.username
  
	  client.emit('return',await this.jwtstrategy.validate(ans))
	  
	  console.log("calling handler")
  
    })
  
    client.emit('welcome',"welcome to the server")
  
    this.clientAndUser[client.id]=this.emailOfConnectedUser
  
	console.log("#####"+this.emailOfConnectedUser+"####")

    if(this.emailOfConnectedUser){

		this.check[client.id]=true;
	
	}
	else{

		client.emit('ERROR','PAYLOAD NOT VERFIFIED HENCE NOT AUTHENTICATED');
		
		this.handleDisconnect(client);
	}

	if(this.check[client.id]){

		this.currConnected[client.id]=this.noOfusers++
  
		const userdata=await this.user.findOne().where('username').equals(this.nameOfConnectedUser).exec();
  	
		userdata.client_id = client.id;
  	
		userdata.save();
  
		this.emailOfConnectedUser=null
  
		this.nameOfConnectedUser=null
  
		client.emit('joined', `welcome user ${client.id}`);
	}

	if(this.check[client.id])
  
    {
  
      const pos = this.games.findIndex((game) => { return game.players == 1 || game.players == 0});
  
      if(pos != -1 && (this.room_status[this.games[pos].gameRoom] != true)){
  
        const game_pos = this.games.findIndex((game) => { return game.gameRoom == this.games[pos].gameRoom});
  
        // this.games[game_pos].users.push(client.id);
  
        this.user_timestamp[client.id] = Date.now();
  
        this.handleJoin( client, this.games[pos].gameRoom);
  
        this.games[pos].players++;
  
        this.user_check[client.id] = `true`;
  
      }
  
      else if(this.check[client.id]){
  
        	this.user_timestamp[client.id] = Date.now();
  
 	        this.handlejoinFirstTime(client);
         
      }
  
    }

  
  }

  
  handlejoinFirstTime(client:Socket){
  
    if(this.check[client.id])
  
    {
  
      let gameId=uuid()
  
      this.games.push({
  
        gameRoom: `${gameId}`,
  
        players: 1
  
      })
  
      client.join(gameId)
  
      client.emit('joinedGame',`welcome to ${gameId}`)
  
      this.users[client.id]=gameId
  
      this.user_check[client.id] = `true`;
  
      this.custom_id[client.id] = uuid();
  
      this.gameCollection[gameId]={
  
        "userarray":[this.clientAndUser[client.id],],
  
        "timestamp":new Date(),
  
        "typeOfGame":"normal",
  
        "status":true,
  
        "moves":10,
  
        "RoomName":"testroom"
  
      }               
  
    }
  
  }

  

  
  handleJoin(client:Socket , game: string):void{
  
    client.join(game)
  
    client.emit('joinedRoom',`welcome to ${game}`);
  
    this.gameCollection[game].userarray.push(this.clientAndUser[client.id])
  
    this.users[client.id] = game;
  
    this.custom_id[client.id] = uuid();
  
  }

  
  handleDisconnect(client: Socket):void {
  
    this.logger.log(`${client.id} disconnected`);
  
	if(this.currConnected[client.id]){

		delete this.currConnected[client.id]
   }

    client.emit('disconnectuser',`user ${client.id} disconnect`)
  
  }

  

  @SubscribeMessage('chat')
  handlechat(client: Socket, data: string):void {
   
	if(this.check[client.id]) 
	
	this.wss.emit('chat',data);
	
	else client.disconnect();
  
}
  

  
  @SubscribeMessage('add1')
  async playgame(client: Socket, data: string)

  {

	let gameid=this.users[client.id]  


	if(data==CardStatus.PAPER || data==CardStatus.ROCK || data==CardStatus.SCISSOR)

	{

		if(this.check[client.id])

		{

			let gameexist= await this.passkey.findOne().where('gameid').equals(gameid).exec();

			let nameinUSERDB =await this.user.findOne().where('client_id').equals(client.id).exec();
    

			if(gameexist)

			{

				gameexist.card1=data

				gameexist.user1=nameinUSERDB.username

				await gameexist.save()

			}
      

			else

			{

				const cardDetail = new this.passkey({

					gameid:gameid,

					card1:data,

					user1:nameinUSERDB.username,

				})
    

				await cardDetail.save()

			} 

			gameexist = await this.passkey.findOne().where('gameid').equals(gameid).exec();

			if(gameexist.card1  && gameexist.card2 && gameexist.card1 !== "empty" && gameexist.card2 !== "empty")

			{
    

				let gameINDB= await this.passkey.findOne().where('gameid').equals(gameid).exec(function(err,db){

					console.log("This is data #########")

					console.log(db)

				});

				const user1name = gameINDB.user1

				const user2name = gameINDB.user2

				const user1card = gameINDB.card1

				const user2card = gameINDB.card2
        

				const gameResult=await  this.playservice.play(gameid);

				if(gameResult === "game is draw"){
					
					this.wss.to(gameid).emit('result',"game is draw")
				
				}

				else

				{

					this.wss.to(gameid).emit('result of round',gameResult+" WON ");

					this.wss.to(gameid).emit(`${user1name}+"cards"`,user1card);

					this.wss.to(gameid).emit(`${user2name}+"cards"`,user2card);

				}

				gameINDB= await this.passkey.findOne().where('gameid').equals(gameid).exec()

				if(gameINDB.playerWin.length == 3)

				{
		  
					let user1=0,user2=0,tie=0;
		  
					console.log(gameINDB.playerWin+"             "+gameINDB.playerWin.length)
		  
					for(let player in gameINDB.playerWin)
		  
					{
			
						console.log(gameINDB[player]+"#####")
			
						if(gameINDB.playerWin[player] === user1name)
			
						user1++;  
			
						else if(gameINDB.playerWin[player] === user2name)
			
						user2++;
			
						else
			
						tie++;
		  
					}
		  
					console.log(user1+"###"+user2+"###"+tie)
		  
					const finalPlayerWon = (user1>user2)?user1name:((user2>user1)?user2name:"game is draw")
		  
					this.wss.to(gameid).emit('final',finalPlayerWon);
		
					}

	 
				}
	
			}
  
		}
  
	}

  
	@SubscribeMessage('add2')
	async playgame1(client: Socket, data: string)
	{

	
		let gameid=this.users[client.id]  

		if(data==CardStatus.PAPER || data==CardStatus.ROCK || data==CardStatus.SCISSOR)

		{

			if(this.check[client.id])

			{

				let gameexist= await this.passkey.findOne().where('gameid').equals(gameid).exec();

				let userINUSERDB =await this.user.findOne().where('client_id').equals(client.id).exec()
	
				console.log(gameexist)
	
				if(gameexist)
	
				{
	
					gameexist.card2=data
	
					gameexist.user2=userINUSERDB.username
	
					await gameexist.save()
	
				}
        
	
				else
	
				{
	
					const cardDetail = new this.passkey({
	
						gameid:gameid,
	
						card2:data,
	
						user2:userINUSERDB.username
	
					})
      
	
					await cardDetail.save()
	
				}

	
				gameexist = await this.passkey.findOne().where('gameid').equals(gameid).exec();

	
				if(gameexist.card1 && gameexist.card2 && gameexist.card1 !== "empty" && gameexist.card2 !== "empty")
	
				{
        
	
					let gameINDB= await this.passkey.findOne().where('gameid').equals(gameid).exec();
	
					const user1name = gameINDB.user1
	
					const user2name = gameINDB.user2
	
					const user1card = gameINDB.card1
	
					const user2card = gameINDB.card2
          
	
					const gameResult=await  this.playservice.play(gameid);
	
					if(gameResult === "game is draw")
	
					this.wss.to(gameid).emit('result',"game is draw")
	
					else
	
					{
	
						this.wss.to(gameid).emit('result of round',gameResult+" WON ");
	
						this.wss.to(gameid).emit(`${user1name}+"cards"`,user1card);
	
						this.wss.to(gameid).emit(`${user2name}+"cards"`,user2card);
	
					}
	
					gameINDB= await this.passkey.findOne().where('gameid').equals(gameid).exec()
	
					if(gameINDB.playerWin.length == 3)
	
					{
	
						let user1=0,user2=0,tie=0;
	
						console.log(gameINDB.playerWin+"             "+gameINDB.playerWin.length)
	
						for(const player in gameINDB.playerWin)
	
						{
	
							console.log(gameINDB[player]+"#####")
	
							if(gameINDB.playerWin[player] === user1name)
	
							user1++;  
	
							else if(gameINDB.playerWin[player] === user2name)
	
							user2++;
	
							else
	
							tie++;
	
						}
	
						console.log(user1+"###"+user2+"###"+tie)
	
						const finalPlayerWon = (user1>user2)?user1name:((user2>user1)?user2name:"game is draw")
	
						this.wss.to(gameid).emit('final',finalPlayerWon);
	
					}
        
	
				}
	
			}
	
		}
  
	}

  
	@SubscribeMessage('list')
	handlelist(client: Socket, data: string):void {

		if(this.check[client.id]) client.emit('list',this.general.users)

		else

		{

			client.emit('warning','unauthorised access')

		}

	}




	@SubscribeMessage('userconnected')
	currconnected(client: Socket, data: string):void {

		if(this.check[client.id]) client.emit('list',this.currConnected)

		else

		{

			client.emit('warning','unauthorised access')

		}

	}





// @SubscribeMessage('showGame')
  
  // showGame(client:Socket){
  
  // if(this.check[client.id])
  
  //   {
  
  //    console.log(this.gameCollection)
  
  //    client.emit('gamecollection',this.gameCollection)
  
  //   }
  
  // }


  
  // @SubscribeMessage('joinGame')
  // joinGame(client:Socket,data:string){
  //    if(this.gameCollection[data] && this.check[client.id])
  //    {
  //      client.join(data)
  //      this.users[client.id]=data
  //      this.gameCollection[data].userarray.push(this.clientAndUser[client.id])
  //      this.check[client.id]=true
  //    }
  // }





}
  
