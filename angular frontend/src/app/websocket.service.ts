import { Injectable } from '@angular/core';
import {map} from 'rxjs/operators'
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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVpIiwidXNlcm5hbWUiOiJ0ZXN0MyIsInJvbGUiOiJQTEFZRVIiLCJpYXQiOjE2MDA3NzY1NjYsImV4cCI6MTYwMDc4MDE2Nn0.AxmnUWQx1PFeWpzhRRi0orVoIH_9hR5TFIwTQWTCAAE")
   }

   

}
