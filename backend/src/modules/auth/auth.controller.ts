import { BadRequestException, Body, Controller, Get, Headers, Post, Query, Res, UnauthorizedException } from "@nestjs/common";
import { MockStoreService } from "../../common/mock-store.service";
import {
  KakaoAuthRequestDto,
  LoginRequestDto,
  LogoutRequestDto,
  RefreshRequestDto,
  SignupRequestDto,
} from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly store: MockStoreService) {}

  @Get("kakao/callback")
  kakaoCallback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Query("error") error: string | undefined,
    @Query("error_description") errorDescription: string | undefined,
    @Res() response: any,
  ) {
    const appScheme = process.env.KAKAO_OAUTH_APP_SCHEME ?? "seoulwalkingpath";
    const appPath = process.env.KAKAO_OAUTH_APP_PATH ?? "oauth/kakao";
    const deepLinkBase = `${appScheme}://${appPath}`;
    const params = new URLSearchParams();
    if (code) params.set("code", code);
    if (state) params.set("state", state);
    if (error) params.set("error", error);
    if (errorDescription) params.set("error_description", errorDescription);
    const redirectUrl = params.toString().length > 0 ? `${deepLinkBase}?${params.toString()}` : deepLinkBase;
    return response.redirect(302, redirectUrl);
  }

  @Post("signup")
  signup(@Body() body: SignupRequestDto) {
    const result = this.store.signup({
      username: body.username,
      password: body.password,
    });
    if (!result.ok) {
      throw new BadRequestException("이미 사용 중인 아이디입니다.");
    }
    return result;
  }

  @Post("login")
  login(@Body() body: LoginRequestDto) {
    const result = this.store.login({
      username: body.username,
      password: body.password,
    });
    if (!result.ok) {
      throw new UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
    return result;
  }

  @Post("kakao")
  async kakao(@Body() body: KakaoAuthRequestDto) {
    const restApiKey = process.env.KAKAO_REST_API_KEY;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET;

    // 개발 환경: mockKakaoUserId 또는 code=dev-* 를 허용해 빠르게 연동 확인
    if (body.mockKakaoUserId || (body.code && body.code.startsWith("dev-"))) {
      const mockId = body.mockKakaoUserId ?? body.code?.replace("dev-", "") ?? "kakao-dev-user";
      const result = this.store.loginWithKakao({
        kakaoUserId: mockId,
        username: `kakao_${mockId}`,
        nickname: "카카오 사용자",
      });
      if (!result.ok) {
        throw new UnauthorizedException("카카오 로그인에 실패했습니다.");
      }
      return result;
    }

    if (!restApiKey) {
      throw new BadRequestException("KAKAO_REST_API_KEY가 설정되지 않았습니다.");
    }
    if (!body.code || !body.redirectUri) {
      throw new BadRequestException("code와 redirectUri가 필요합니다.");
    }

    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: restApiKey,
      code: body.code,
      redirect_uri: body.redirectUri,
    });
    if (clientSecret) {
      tokenParams.set("client_secret", clientSecret);
    }

    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: tokenParams.toString(),
    });

    if (!tokenRes.ok) {
      const errorBody = await tokenRes.text();
      throw new UnauthorizedException(`카카오 토큰 교환에 실패했습니다. ${errorBody}`);
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      throw new UnauthorizedException("카카오 액세스 토큰이 없습니다.");
    }

    const userRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
      },
    });

    if (!userRes.ok) {
      throw new UnauthorizedException("카카오 사용자 조회에 실패했습니다.");
    }

    const userJson = (await userRes.json()) as {
      id?: number;
      kakao_account?: { email?: string };
      properties?: { nickname?: string };
    };

    if (!userJson.id) {
      throw new UnauthorizedException("카카오 사용자 식별값이 없습니다.");
    }

    const result = this.store.loginWithKakao({
      kakaoUserId: String(userJson.id),
      username: userJson.properties?.nickname,
      nickname: userJson.properties?.nickname,
    });
    if (!result.ok) {
      throw new UnauthorizedException("카카오 로그인 처리에 실패했습니다.");
    }
    return result;
  }

  @Post("refresh")
  refresh(@Body() body: RefreshRequestDto) {
    const result = this.store.refresh({ refreshToken: body.refreshToken });
    if (!result.ok) {
      throw new UnauthorizedException("리프레시 토큰이 유효하지 않습니다.");
    }
    return result;
  }

  @Post("logout")
  logout(@Body() body: LogoutRequestDto) {
    return this.store.logout({ refreshToken: body.refreshToken });
  }

  @Get("session")
  session(@Headers("authorization") authorization?: string) {
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
    const user = this.store.getUserByAccessToken(token);
    if (!user) {
      throw new UnauthorizedException("세션이 유효하지 않습니다.");
    }
    return { user };
  }
}
