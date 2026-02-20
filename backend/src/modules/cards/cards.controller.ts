import { Controller, Get, Query } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";

@Controller("cards")
export class CardsController {
  constructor(private readonly store: MockStoreService) {}

  @Get("catalog")
  catalog(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("userId") userId?: string,
    @Query("region") region?: string,
    @Query("sort") sort?: string,
  ) {
    return this.store.getCardCatalog({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      userId: userId ?? "demo-user",
      region,
      sort,
    });
  }

  @Get("my")
  my(@Query("userId") userId?: string) {
    return this.store.getMyCards(userId ?? "demo-user");
  }
}
