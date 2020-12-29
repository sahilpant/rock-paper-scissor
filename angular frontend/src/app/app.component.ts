import { Component } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import { WebsocketService} from './websocket.service'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
 mes:any;
  constructor(private webSocketservice:WebsocketService,
    private socket:Socket){
    this.webSocketservice.onConnection()
    this.socket.on('return',data=> console.log(data))
    this.socket.on('listen', data => console.log(data))
    this.socket.on('new_match_response', data => console.log(data))
    this.socket.on('match_details', data => console.log(data))
    this.socket.on('start_match_response', data => console.log(data))
    this.socket.on('activerooms_response', (data) => {
      console.log(data)});
      this.socket.on('getroomID_response', (data) => {
        console.log(data);
        var rid = Object.keys(data)[0];
        localStorage.setItem('roomID',rid);
      
      });

      this.socket.on('room_check_response', data => console.log(data));
      this.socket.on('roomj', data => console.log(data));
      this.socket.on('chat_response', data => console.log(data));
      this.socket.on('move_response', data => console.log(data));
      this.socket.on('private_response',data => console.log(data));
      this.socket.on('pending_match_request_response', data => console.log(data));
    
  }
  
    extra(){  
  
      this.webSocketservice.handlereq();
    }

    test(){
      this.webSocketservice.testmessage();
    }
     public(){

      this.webSocketservice.public();
     }  
     private(){

      this.webSocketservice.private();
     }  

     guestaction(){
       this.webSocketservice.guest_action();
     }

     invite(){

      this.webSocketservice.invite();
     }

     pendingrequest(){
       this.webSocketservice.pendingrequest();
     }

     joingameByInvite(){
       this.webSocketservice.joingamebyInvite();
     }

     matchdetails(){
       this.webSocketservice.matchdetails()
     }

     deletegames(){
      this.webSocketservice.deleteGame();
    }
    userinfo(){
      this.webSocketservice.userinfo();
    }

     startmatch(){
      this.webSocketservice.startmatch()
     }

     activerroms(){
      this.webSocketservice.activerooms()
     }
     getroomID(){
       this.webSocketservice.getgameID();
     }

     play(){
       this.webSocketservice.play()
     }

     display(){
       console.log(this.mes)
     }
     EndGame(){
       this.webSocketservice.endGame()
     }

     checkmsg(){
       this.webSocketservice.checkmsg();
     }

     joinroom(){
       console.log("rerre");
       this.webSocketservice.joinroom();
     }

     chat(){
      this.webSocketservice.chat();
     }


  title = 'ngapp';
}
