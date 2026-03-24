import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAcademicSystemTables1731234568000
  implements MigrationInterface
{
  name = 'CreateAcademicSystemTables1731234568000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. departments (no dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "code" character varying NOT NULL,
        "parent_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_departments" PRIMARY KEY ("id")
      )
    `);

    // 2. academic_periods (no dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "academic_periods" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "code" character varying NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_academic_periods" PRIMARY KEY ("id")
      )
    `);

    // 3. teachers (users, departments)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "teachers" (
        "id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "employee_code" character varying NOT NULL,
        "department_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_teachers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_teachers_employee_code" UNIQUE ("employee_code")
      )
    `);

    // 4. programs (departments)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "programs" (
        "id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "code" character varying NOT NULL,
        "credits_required" integer NOT NULL DEFAULT 0,
        "department_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_programs" PRIMARY KEY ("id")
      )
    `);

    // 5. student_programs (students, programs)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_programs" (
        "id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "program_id" uuid NOT NULL,
        "enrollment_date" date NOT NULL,
        "status" character varying NOT NULL DEFAULT 'active',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_programs" PRIMARY KEY ("id")
      )
    `);

    // 6. classrooms (no dependencies)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "classrooms" (
        "id" uuid NOT NULL,
        "code" character varying NOT NULL,
        "building" character varying NOT NULL,
        "capacity" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_classrooms" PRIMARY KEY ("id")
      )
    `);

    // 7. course_offerings (courses, academic_periods, teachers)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_offerings" (
        "id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "academic_period_id" uuid NOT NULL,
        "teacher_id" uuid NOT NULL,
        "section_code" character varying NOT NULL,
        "capacity" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_course_offerings" PRIMARY KEY ("id")
      )
    `);

    // 8. course_prerequisites (courses self-ref)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_prerequisites" (
        "id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "prerequisite_course_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_course_prerequisites" PRIMARY KEY ("id")
      )
    `);

    // 9. program_courses (programs, courses)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "program_courses" (
        "id" uuid NOT NULL,
        "program_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "is_required" boolean NOT NULL DEFAULT true,
        "semester_number" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_program_courses" PRIMARY KEY ("id")
      )
    `);

    // 10. enrollments (students, course_offerings)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "enrollments" (
        "id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "course_offering_id" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'enrolled',
        "enrolled_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enrollments" PRIMARY KEY ("id")
      )
    `);

    // 11. evaluations (course_offerings)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "evaluations" (
        "id" uuid NOT NULL,
        "course_offering_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "weight_percent" integer NOT NULL,
        "due_date" date,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_evaluations" PRIMARY KEY ("id")
      )
    `);

    // 12. grades (students, course_offerings)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "grades" (
        "id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "course_offering_id" uuid NOT NULL,
        "grade_value" numeric(5,2) NOT NULL,
        "grade_type" character varying NOT NULL DEFAULT 'numeric',
        "status" character varying NOT NULL DEFAULT 'final',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grades" PRIMARY KEY ("id")
      )
    `);

    // 13. evaluation_grades (evaluations, students)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "evaluation_grades" (
        "id" uuid NOT NULL,
        "evaluation_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "score" numeric(5,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_evaluation_grades" PRIMARY KEY ("id")
      )
    `);

    // 14. attendance (schedules, students)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "attendance" (
        "id" uuid NOT NULL,
        "schedule_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "date" date NOT NULL,
        "status" character varying NOT NULL DEFAULT 'present',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attendance" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "attendance"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "evaluation_grades"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grades"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "evaluations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "enrollments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "program_courses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_prerequisites"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_offerings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "classrooms"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_programs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "programs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teachers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "academic_periods"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments"`);
  }
}
