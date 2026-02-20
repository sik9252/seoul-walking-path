import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class SignupRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginRequestDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/)
  username!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class KakaoAuthRequestDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  redirectUri?: string;

  @IsOptional()
  @IsString()
  mockKakaoUserId?: string;
}

export class RefreshRequestDto {
  @IsString()
  refreshToken!: string;
}

export class LogoutRequestDto {
  @IsString()
  refreshToken!: string;
}
