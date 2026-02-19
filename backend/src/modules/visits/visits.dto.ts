import { IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class VisitCheckRequestDto {
  @IsString()
  userId!: string;

  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(500)
  radiusM?: number;
}
