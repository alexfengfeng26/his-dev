import { Global, Module } from '@nestjs/common';
import { JwtUtil } from '../../common/utils/jwt.util';

@Global()
@Module({
  providers: [JwtUtil],
  exports: [JwtUtil],
})
export class CommonModule {}