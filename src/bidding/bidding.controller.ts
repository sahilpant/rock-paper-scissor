import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { BiddingService } from './bidding.service';
import { itemtoBeBidDTO } from './itemToBebid.dto';

@Controller('bidding')
export class BiddingController {

    constructor(private bidservice:BiddingService){}

    @Post('/sellitem')
    @ApiBody({type: itemtoBeBidDTO})
    @ApiCreatedResponse({description: "An object with response with response in res key."})
    createUser(@Body() bidDto:itemtoBeBidDTO){
      
      return this.bidservice.sellItem(bidDto)
    
    }
}
