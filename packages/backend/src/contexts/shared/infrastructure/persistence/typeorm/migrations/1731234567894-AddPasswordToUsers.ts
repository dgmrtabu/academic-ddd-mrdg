import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPasswordToUsers1731234567894 implements MigrationInterface {
  name = 'AddPasswordToUsers1731234567894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "password" character varying NOT NULL DEFAULT ''
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "password" DROP DEFAULT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "password"
    `);
  }
}
