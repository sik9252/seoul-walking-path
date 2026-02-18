import { Module } from "@nestjs/common";
import { MockStoreService } from "./common/mock-store.service";
import { AttemptsController } from "./modules/attempts/attempts.controller";
import { FavoritesController } from "./modules/favorites/favorites.controller";
import { HealthController } from "./modules/health/health.controller";
import { PoisController } from "./modules/pois/pois.controller";
import { RoutesController } from "./modules/routes/routes.controller";
import { SessionsController } from "./modules/sessions/sessions.controller";

@Module({
  imports: [],
  controllers: [
    HealthController,
    RoutesController,
    PoisController,
    SessionsController,
    FavoritesController,
    AttemptsController,
  ],
  providers: [MockStoreService],
})
export class AppModule {}
