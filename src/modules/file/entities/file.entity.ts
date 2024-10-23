// src/file/file.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity'; 
import { Task } from 'src/modules/task/entities/task.entity';

@Entity({ name: 'files' })
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'bytea' })
  data: Buffer;

  @Column()
  filename: string;

  @Column()
  mimetype: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.files, { eager: true , nullable: true})
  user: UserEntity;

  @ManyToOne(() => Task, (task) => task.files, { eager: true, nullable: true})
  task: Task
}
