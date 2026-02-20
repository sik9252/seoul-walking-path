import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class SignupRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}

export class LoginRequestDto {
  @IsEmail()
  email!: string;

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
