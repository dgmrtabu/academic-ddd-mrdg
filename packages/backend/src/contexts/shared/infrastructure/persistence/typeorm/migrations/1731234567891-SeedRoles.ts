import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoles1731234567891 implements MigrationInterface {
  name = 'SeedRoles1731234567891';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminId = 'a0000000-0000-4000-8000-000000000001';
    const studentId = 'a0000000-0000-4000-8000-000000000002';
    const teacherId = 'a0000000-0000-4000-8000-000000000003';

    const adminPerms =
      'courses:create,courses:read,courses:update,courses:delete,schedule:create,schedule:read,schedule:update,schedule:delete,student:create,student:read,student:update,student:delete,users:create,users:read,users:update,users:delete';
    const studentTeacherPerms =
      'courses:read,schedule:read,student:read,student:update,users:read,users:update';

    await queryRunner.query(
      `INSERT INTO "roles" ("id", "name", "permissions", "created_at", "updated_at")
       VALUES ($1, $2, $3, now(), now())
       ON CONFLICT ("id") DO NOTHING`,
      [adminId, 'ADMINISTRATOR', adminPerms],
    );
    await queryRunner.query(
      `INSERT INTO "roles" ("id", "name", "permissions", "created_at", "updated_at")
       VALUES ($1, $2, $3, now(), now())
       ON CONFLICT ("id") DO NOTHING`,
      [studentId, 'STUDENT', studentTeacherPerms],
    );
    await queryRunner.query(
      `INSERT INTO "roles" ("id", "name", "permissions", "created_at", "updated_at")
       VALUES ($1, $2, $3, now(), now())
       ON CONFLICT ("id") DO NOTHING`,
      [teacherId, 'TEACHER', studentTeacherPerms],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "roles" WHERE "name" IN ('ADMINISTRATOR', 'STUDENT', 'TEACHER')`,
    );
  }
}
