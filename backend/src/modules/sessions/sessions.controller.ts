import { Body, Controller, Get, Post } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";
import { CreateSessionDto } from "./sessions.dto";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly store: MockStoreService) {}

  @Get()
  list() {
    return this.store.getSessions();
  }

  @Post()
  create(@Body() body: CreateSessionDto) {
    return this.store.createSession(body);
  }
}
