import { Module } from "@nestjs/common";
import { CardsController } from "./modules/cards/cards.controller";
import { MockStoreService } from "./common/mock-store.service";
import { HealthController } from "./modules/health/health.controller";
import { PlacesController } from "./modules/places/places.controller";
import { VisitsController } from "./modules/visits/visits.controller";
import { AuthController } from "./modules/auth/auth.controller";

@Module({
  imports: [],
  controllers: [HealthController, PlacesController, VisitsController, CardsController, AuthController],
  providers: [MockStoreService],
})
export class AppModule {}
