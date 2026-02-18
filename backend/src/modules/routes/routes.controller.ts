import { Controller, Get, Param, Query } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";

@Controller("routes")
export class RoutesController {
  constructor(private readonly store: MockStoreService) {}

  @Get()
  list(@Query("page") page?: string, @Query("pageSize") pageSize?: string) {
    const parsedPage = page ? Number(page) : 1;
    const parsedPageSize = pageSize ? Number(pageSize) : 20;
    return this.store.getRoutesPage(parsedPage, parsedPageSize);
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
