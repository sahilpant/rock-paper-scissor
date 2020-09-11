import { Injectable } from "@nestjs/common";
import { registerAs } from "@nestjs/config";

export default () => ({
  // port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.host,
    port: process.env.PORT
  }
});

 @Injectable()
  export class configss{

     port= 1000;

    returnport(){
     return this.port
    }


  }
  