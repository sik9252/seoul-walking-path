import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  routeId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  startedAt!: string;

  @IsInt()
  @Min(0)
  durationSec!: number;

  @IsNumber()
  @Min(0)
  distanceMeters!: number;

  @IsInt()
  @Min(0)
  kcal!: number;
}
