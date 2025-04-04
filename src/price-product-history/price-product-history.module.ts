import { Module } from "@nestjs/common";
import { PriceProductHistoryService } from "./price-product-history.service";

@Module({
  providers: [PriceProductHistoryService],
  exports: [PriceProductHistoryService]
})
export class PriceProductHistoryModule { }
