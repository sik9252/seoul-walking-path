import { Controller, Get, Query } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";

@Controller("places")
export class PlacesController {
  constructor(private readonly store: MockStoreService) {}

  @Get()
  list(
    @Query("lat") lat?: string,
    @Query("lng") lng?: string,
    @Query("radius") radius?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.store.getPlaces({
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      radius: radius ? Number(radius) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }
}
