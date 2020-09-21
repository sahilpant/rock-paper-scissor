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

     this.socket.emit('handler',"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNhaGlsQG1haWwuY29tXyIsInVzZXJuYW1lIjoibmV3X3NhaGlsXyIsInJvbGUiOiJQTEFZRVIiLCJpYXQiOjE2MDA2OTYzMDIsImV4cCI6MTYwMDY5OTkwMn0.vXrsWW6RVglicUkaXlublP492WFwj3t0z65aoyEMCfE")
   }

   

}
