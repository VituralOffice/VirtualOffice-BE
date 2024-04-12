import { Module } from "@nestjs/common";
import { AuthDatabaseModule } from "./database/connection/auth";
import { TokenModule } from "./auth/token/module";
import { LoggerModule } from "./global/logger/module";
import { GlobalModule } from "./global/module";

import { HealthModule } from "./health/module";
import { LoginModule } from "./login/module";
import { UserModule } from "./user/module";

@Module({
  imports: [
    HealthModule,
    GlobalModule,
    AuthDatabaseModule,
    TokenModule,
    LoginModule,
    UserModule,
    LoggerModule,
  ],
})
export class MainModule {}
