import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io'
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  constructor(private socket:Socket) { }
 
   onConnection(){
     this.socket.on('connection',data=> console.log(data))
   }

   handlereq(){

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaGlsQG1haWwuY29tIiwidXNlcm5hbWUiOiJuZXdfc2FoaWwiLCJyb2xlIjoiUExBWUVSIiwiaWF0IjoxNjAwNDM2MTg0LCJleHAiOjE2MDA0Mzk3ODR9.kVpyiteWq8YHb2m5hM9jtn8e_iJMu7vwVirlJAWAzFk")
   }

   

}
