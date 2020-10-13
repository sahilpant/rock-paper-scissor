import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BiddingController } from './bidding.controller';
import { BiddingService } from './bidding.service';
import { cardToBeBid } from './itemToBeBidded.model';

@Module({
  imports:[MongooseModule.forFeature([{name:"cardBid",schema:cardToBeBid}])],
  controllers: [BiddingController],
  providers: [BiddingService]
})
export class BiddingModule {}
