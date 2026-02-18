import { Controller, Get, Param, Post } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";

@Controller("favorites")
export class FavoritesController {
  constructor(private readonly store: MockStoreService) {}

  @Get()
  list() {
    return this.store.getFavorites();
  }

  @Post(":routeId/toggle")
  toggle(@Param("routeId") routeId: string) {
    return this.store.toggleFavorite(routeId);
  }
}
