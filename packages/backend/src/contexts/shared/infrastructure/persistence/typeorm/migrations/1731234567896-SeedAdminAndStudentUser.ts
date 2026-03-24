import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const ADMIN_USER_ID = 'b0000000-0000-4000-8000-000000000001';
const STUDENT_USER_ID = 'b0000000-0000-4000-8000-000000000002';
const STUDENT_RECORD_ID = 'c0000000-0000-4000-8000-000000000001';
const ROLE_ADMIN_ID = 'a0000000-0000-4000-8000-000000000001';
const ROLE_STUDENT_ID = 'a0000000-0000-4000-8000-000000000002';

export class SeedAdminAndStudentUser1731234567896 implements MigrationInterface {
  name = 'SeedAdminAndStudentUser1731234567896';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminPasswordHash = await bcrypt.hash('Admin123!', SALT_ROUNDS);
    const studentPasswordHash = await bcrypt.hash('Alumno123!', SALT_ROUNDS);

    await queryRunner.query(
      `INSERT INTO "users" ("id", "username", "email", "role_id", "password", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $5, now(), now())
       ON CONFLICT ("username") DO NOTHING`,
      [
        ADMIN_USER_ID,
        'admin',
        'admin@academic.local',
        ROLE_ADMIN_ID,
        adminPasswordHash,
      ],
    );

    await queryRunner.query(
      `INSERT INTO "users" ("id", "username", "email", "role_id", "password", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $5, now(), now())
       ON CONFLICT ("username") DO NOTHING`,
      [
        STUDENT_USER_ID,
        'jperez',
        'jperez@academic.local',
        ROLE_STUDENT_ID,
        studentPasswordHash,
      ],
    );

    await queryRunner.query(
      `INSERT INTO "students" ("id", "first_name", "last_name", "document", "birth_date", "code", "user_id", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())
       ON CONFLICT ("id") DO NOTHING`,
      [
        STUDENT_RECORD_ID,
        'Juan',
        'Pérez',
        '12345678',
        '2000-05-15',
        'ALUMNO-00001',
        STUDENT_USER_ID,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "students" WHERE "id" = '${STUDENT_RECORD_ID}'`,
    );
    await queryRunner.query(
      `DELETE FROM "users" WHERE "id" IN ('${ADMIN_USER_ID}', '${STUDENT_USER_ID}')`,
    );
  }
}
