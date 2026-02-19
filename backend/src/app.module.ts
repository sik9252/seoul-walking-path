import { Module } from "@nestjs/common";
import { CardsController } from "./modules/cards/cards.controller";
import { MockStoreService } from "./common/mock-store.service";
import { HealthController } from "./modules/health/health.controller";
import { PlacesController } from "./modules/places/places.controller";
import { VisitsController } from "./modules/visits/visits.controller";

@Module({
  imports: [],
  controllers: [HealthController, PlacesController, VisitsController, CardsController],
  providers: [MockStoreService],
})
export class AppModule {}
