import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { BiddingService } from './bidding.service';
import { bidDTO, itemtoBeBidDTO } from './itemToBebid.dto';

@Controller('bidding')
export class BiddingController {

    constructor(private bidservice:BiddingService){}

    @Post('/sellitem')
    @ApiBody({type: itemtoBeBidDTO})
    @ApiCreatedResponse({description: "An object with response with response in res key."})
    @ApiBadRequestResponse()
    sellitem(@Body() bidDto:itemtoBeBidDTO){
      
      return this.bidservice.sellItem(bidDto)
    
    }

    
    @Post('/buyitem')
    @ApiCreatedResponse({description: "An object with response with response in res key."})
    buy(@Body() biddto:bidDTO){
      
      return this.bidservice.buyItem(biddto)
    
    }


    @Get('/getallItems')
    @ApiCreatedResponse({description: "Get all listed cards for bidding."})
    getall(){
        return this.bidservice.getall()
    }
}
