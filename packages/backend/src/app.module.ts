import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiModule } from './apps/api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'global',
          ttl: 60_000,
          limit: 100,
        },
        {
          name: 'auth',
          ttl: 60_000,
          limit: 10,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        // type: 'postgres',
        // host: process.env.TYPEORM_HOST ?? 'localhost',
        // port: parseInt(process.env.TYPEORM_PORT ?? '5432', 10),
        // username: process.env.TYPEORM_USERNAME ?? 'postgres',
        // password: process.env.TYPEORM_PASSWORD ?? 'postgres',
        // database: process.env.TYPEORM_DATABASE ?? 'academic',
        // autoLoadEntities: true,
        // synchronize: false,
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: false,
        ssl: { rejectUnauthorized: false },        
      }),
    }),
    ApiModule,
  ],
})
export class AppModule {}
