import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserTypeOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column('uuid')
  roleId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
