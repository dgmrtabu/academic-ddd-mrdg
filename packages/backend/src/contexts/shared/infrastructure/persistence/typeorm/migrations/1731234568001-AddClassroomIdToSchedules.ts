import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassroomIdToSchedules1731234568001
  implements MigrationInterface
{
  name = 'AddClassroomIdToSchedules1731234568001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedules"
      ADD COLUMN IF NOT EXISTS "classroom_id" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedules" DROP COLUMN IF EXISTS "classroom_id"
    `);
  }
}
