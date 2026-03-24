import { MigrationInterface, QueryRunner } from 'typeorm';

const COURSE_IDS = {
  MAT: 'b0000000-0000-4000-8000-000000000001',
  FIS: 'b0000000-0000-4000-8000-000000000002',
  QUI: 'b0000000-0000-4000-8000-000000000003',
};

export class SeedCoursesAndSchedules1731234567893 implements MigrationInterface {
  name = 'SeedCoursesAndSchedules1731234567893';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "courses" ("id", "name", "code", "credits", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, now(), now())
       ON CONFLICT ("id") DO NOTHING`,
      [COURSE_IDS.MAT, 'MATEMATICA', 'MAT', 4],
    );
    await queryRunner.query(
      `INSERT INTO "courses" ("id", "name", "code", "credits", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, now(), now())
       ON CONFLICT ("id") DO NOTHING`,
      [COURSE_IDS.FIS, 'FISICA', 'FIS', 4],
    );
    await queryRunner.query(
      `INSERT INTO "courses" ("id", "name", "code", "credits", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, now(), now())
       ON CONFLICT ("id") DO NOTHING`,
      [COURSE_IDS.QUI, 'QUIMICA', 'QUI', 4],
    );

    const scheduleSlots: { id: string; courseId: string; slot: string }[] = [
      {
        id: 'c0000000-0000-4000-8000-000000000001',
        courseId: COURSE_IDS.MAT,
        slot: 'Lunes 08:00-10:00',
      },
      {
        id: 'c0000000-0000-4000-8000-000000000002',
        courseId: COURSE_IDS.MAT,
        slot: 'Miércoles 08:00-10:00',
      },
      {
        id: 'c0000000-0000-4000-8000-000000000003',
        courseId: COURSE_IDS.FIS,
        slot: 'Martes 10:00-12:00',
      },
      {
        id: 'c0000000-0000-4000-8000-000000000004',
        courseId: COURSE_IDS.FIS,
        slot: 'Jueves 10:00-12:00',
      },
      {
        id: 'c0000000-0000-4000-8000-000000000005',
        courseId: COURSE_IDS.QUI,
        slot: 'Martes 14:00-16:00',
      },
      {
        id: 'c0000000-0000-4000-8000-000000000006',
        courseId: COURSE_IDS.QUI,
        slot: 'Viernes 14:00-16:00',
      },
    ];

    for (const { id, courseId, slot } of scheduleSlots) {
      await queryRunner.query(
        `INSERT INTO "schedules" ("id", "course_id", "slot", "created_at", "updated_at")
         VALUES ($1, $2, $3, now(), now())
         ON CONFLICT ("id") DO NOTHING`,
        [id, courseId, slot],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "schedules" WHERE "course_id" IN ($1, $2, $3)`,
      [COURSE_IDS.MAT, COURSE_IDS.FIS, COURSE_IDS.QUI],
    );
    await queryRunner.query(
      `DELETE FROM "courses" WHERE "id" IN ($1, $2, $3)`,
      [COURSE_IDS.MAT, COURSE_IDS.FIS, COURSE_IDS.QUI],
    );
  }
}
