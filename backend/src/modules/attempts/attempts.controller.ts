import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";
import { CreateAttemptDto, SubmitLocationDto } from "./attempts.dto";

@Controller("attempts")
export class AttemptsController {
  constructor(private readonly store: MockStoreService) {}

  @Post()
  create(@Body() body: CreateAttemptDto) {
    return this.store.createAttempt(body.userId, body.routeId);
  }

  @Get(":attemptId")
  progress(@Param("attemptId") attemptId: string) {
    return this.store.getAttemptProgress(attemptId);
  }

  @Post(":attemptId/location")
  submitLocation(@Param("attemptId") attemptId: string, @Body() body: SubmitLocationDto) {
    return this.store.submitAttemptLocation(attemptId, body.lat, body.lng, body.recordedAt);
  }

  @Post(":attemptId/complete")
  complete(@Param("attemptId") attemptId: string) {
    return this.store.completeAttempt(attemptId);
  }
}
