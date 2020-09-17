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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0cmluZzk5OSIsInVzZXJuYW1lIjoic3RyaW5nOTk5Iiwicm9sZSI6IlBMQVlFUiIsImlhdCI6MTYwMDM0NDIyNywiZXhwIjoxNjAwMzQ3ODI3fQ.yVi1WZr8IOJwuW2KPOV3AVk-NfDQuhtqeRuRVHmoeJs")
   }

   

}
