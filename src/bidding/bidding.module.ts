import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { user } from 'src/schemas/user.model';
import { BiddingController } from './bidding.controller';
import { BiddingService } from './bidding.service';
import { cardToBeBid } from './itemToBeBidded.model';

@Module({
  imports:[MongooseModule.forFeature([{name:"cardBid",schema:cardToBeBid},{name:"user",schema:user}])],
  controllers: [BiddingController],
  providers: [BiddingService]
})
export class BiddingModule {}
