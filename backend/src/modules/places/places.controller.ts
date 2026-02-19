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
    @Query("minLat") minLat?: string,
    @Query("maxLat") maxLat?: string,
    @Query("minLng") minLng?: string,
    @Query("maxLng") maxLng?: string,
    @Query("limit") limit?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    return this.store.getPlaces({
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      radius: radius ? Number(radius) : undefined,
      minLat: minLat ? Number(minLat) : undefined,
      maxLat: maxLat ? Number(maxLat) : undefined,
      minLng: minLng ? Number(minLng) : undefined,
      maxLng: maxLng ? Number(maxLng) : undefined,
      limit: limit ? Number(limit) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
  }
}
