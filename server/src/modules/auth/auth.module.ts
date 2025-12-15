import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { JwtUtil } from '../../common/utils/jwt.util';
import { PasswordUtil } from '../../common/utils/password.util';
import { User } from '../../models/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtUtil,
    PasswordUtil,
    JwtAuthGuard,
  ],
  exports: [
    AuthService,
    JwtUtil,
    PasswordUtil,
    JwtAuthGuard,
  ],
})
export class AuthModule {}