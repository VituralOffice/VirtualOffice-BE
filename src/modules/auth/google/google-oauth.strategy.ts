import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/service';
import { ISecretsService } from 'src/modules/global/secrets/adapter';
import { CharacterService } from 'src/modules/character/service';
import { PlanService } from 'src/modules/plan/service';
import { SubscriptionService } from 'src/modules/subcription/service';
import { UserEntity } from 'src/modules/user/entity';

@Injectable()
export class GoogleOauthStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    secretsService: ISecretsService,
    private readonly userService: UserService,
    private readonly characterService: CharacterService,
    private readonly planService: PlanService,
    private readonly subscriptionService: SubscriptionService,
  ) {
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
    let user = await this.userService.findByEmail(email);
    if (!user) {
      const character = await this.characterService.findRandomOne();
      const userEntity = new UserEntity();
      userEntity.email = email;
      userEntity.providerId = id;
      userEntity.provider = 'google';
      userEntity.fullname = `${name.familyName} ${name.givenName}`;
      userEntity.isVerified = true;
      userEntity.character = character._id.toString();
      user = await this.userService.create(userEntity);
      // subscribe free plan for new user
      const freePlan = await this.planService.findOne({ free: true });
      await this.subscriptionService.subscribeFreePlan(user, freePlan);
    }
    return user;
  }
}
