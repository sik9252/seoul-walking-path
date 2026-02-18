import { Controller, Get, Query } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";
import { PoiCategory } from "../../common/models";

@Controller("pois")
export class PoisController {
  constructor(private readonly store: MockStoreService) {}

  @Get()
  list(@Query("routeId") routeId?: string, @Query("category") category?: PoiCategory) {
    return this.store.getPois(routeId, category);
  }
}
