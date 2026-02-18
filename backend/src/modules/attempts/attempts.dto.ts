import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAttemptDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  routeId!: string;
}

export class SubmitLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsString()
  @IsNotEmpty()
  recordedAt!: string;
}
