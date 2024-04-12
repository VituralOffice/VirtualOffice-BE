import { Module } from "@nestjs/common";
import { ISecretsService } from "src/modules/global/secrets/adapter";
import { SecretsModule } from "src/modules/global/secrets/module";

import { ITokenService } from "./adapter";
import { TokenService } from "./service";

@Module({
  imports: [SecretsModule],
  providers: [
    {
      provide: ITokenService,
      useFactory: (secret: ISecretsService) => new TokenService(secret),
      inject: [ISecretsService],
    },
  ],
  exports: [ITokenService],
})
export class TokenModule {}
