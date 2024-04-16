import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/modules/user/adapter';
import { ISecretsService } from 'src/modules/global/secrets/adapter';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(secretsService: ISecretsService, private readonly userRepository: IUserRepository) {
    super({
      clientID: secretsService.oauthGoogle.clientId,
      clientSecret: secretsService.oauthGoogle.clientSecret,
      callbackURL: secretsService.oauthGoogle.redirectUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile) {
    const { id, name, emails, profileUrl } = profile;
    const [{ value: email }] = emails;
    let user = await this.userRepository.findOne({
      email,
    });
    if (!user) {
      user = await this.userRepository.create({
        provider: 'google',
        providerId: id,
        fullname: name.givenName,
        email,
        avatar: profileUrl,
      });
    }
    return user;
  }
}
