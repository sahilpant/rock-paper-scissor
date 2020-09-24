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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3QyQCIsInVzZXJuYW1lIjoidGVzdDIiLCJyb2xlIjoiUExBWUVSIiwiaWF0IjoxNjAwODYzMDI0LCJleHAiOjE2MDA4OTkwMjR9.JHYK4hL3UgQbSBvR9c1sT1xKxcio3wz_cE8NJ101juE")
   }

   

}
