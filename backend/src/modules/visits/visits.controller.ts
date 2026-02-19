import { Body, Controller, Post } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";
import { VisitCheckRequestDto } from "./visits.dto";

@Controller("visits")
export class VisitsController {
  constructor(private readonly store: MockStoreService) {}

  @Post("check")
  check(@Body() body: VisitCheckRequestDto) {
    return this.store.checkPlaceVisit({
      userId: body.userId,
      lat: body.lat,
      lng: body.lng,
      radiusM: body.radiusM ?? 50,
    });
  }
}
