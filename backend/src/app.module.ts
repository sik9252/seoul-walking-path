import { Module } from "@nestjs/common";
import { CardsController } from "./modules/cards/cards.controller";
import { MockStoreService } from "./common/mock-store.service";
import { AttemptsController } from "./modules/attempts/attempts.controller";
import { FavoritesController } from "./modules/favorites/favorites.controller";
import { HealthController } from "./modules/health/health.controller";
import { PlacesController } from "./modules/places/places.controller";
import { PoisController } from "./modules/pois/pois.controller";
import { RoutesController } from "./modules/routes/routes.controller";
import { SessionsController } from "./modules/sessions/sessions.controller";
import { VisitsController } from "./modules/visits/visits.controller";

@Module({
  imports: [],
  controllers: [
    HealthController,
    RoutesController,
    PoisController,
    SessionsController,
    FavoritesController,
    AttemptsController,
    PlacesController,
    VisitsController,
    CardsController,
  ],
  providers: [MockStoreService],
})
export class AppModule {}
