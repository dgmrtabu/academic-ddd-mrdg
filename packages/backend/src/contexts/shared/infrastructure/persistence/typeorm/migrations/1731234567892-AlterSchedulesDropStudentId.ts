import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedulesDropStudentId1731234567892
  implements MigrationInterface
{
  name = 'AlterSchedulesDropStudentId1731234567892';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedules" DROP COLUMN IF EXISTS "student_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedules" ADD COLUMN "student_id" uuid
    `);
  }
}
