import { Controller, Get, Param } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";

@Controller("routes")
export class RoutesController {
  constructor(private readonly store: MockStoreService) {}

  @Get()
  list() {
    return this.store.getRoutes();
  }

  @Get(":routeId")
  detail(@Param("routeId") routeId: string) {
    return this.store.getRouteById(routeId);
  }

  @Get(":routeId/checkpoints")
  checkpoints(@Param("routeId") routeId: string) {
    return this.store.getRouteCheckpoints(routeId);
  }
}
