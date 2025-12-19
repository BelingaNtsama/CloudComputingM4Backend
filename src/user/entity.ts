import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Announce } from 'src/announces/entities/announce.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @OneToMany(() => Announce, (announce) => announce.user)
  announces: Announce[];
}
