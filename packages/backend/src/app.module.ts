import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './apps/api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.TYPEORM_HOST ?? 'localhost',
        port: parseInt(process.env.TYPEORM_PORT ?? '5432', 10),
        username: process.env.TYPEORM_USERNAME ?? 'postgres',
        password: process.env.TYPEORM_PASSWORD ?? 'postgres',
        database: process.env.TYPEORM_DATABASE ?? 'academic',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    ApiModule,
  ],
})
export class AppModule {}
