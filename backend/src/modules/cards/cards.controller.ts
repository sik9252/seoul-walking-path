import { Controller, Get, Query } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";

@Controller("cards")
export class CardsController {
  constructor(private readonly store: MockStoreService) {}

  @Get("catalog")
  catalog(@Query("page") page?: string, @Query("pageSize") pageSize?: string) {
    return this.store.getCardCatalog(page ? Number(page) : 1, pageSize ? Number(pageSize) : 20);
  }

  @Get("my")
  my(@Query("userId") userId?: string) {
    return this.store.getMyCards(userId ?? "demo-user");
  }
}
