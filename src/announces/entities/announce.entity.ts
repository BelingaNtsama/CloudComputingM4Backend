import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/entity';

@Entity('announces')
export class Announce {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  titre: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // VENTE, LOCATION, SERVICE

  @Column({ type: 'integer', nullable: true })
  prix?: number;

  @Column({ length: 1000 })
  description: string;

  @Column({ length: 50 })
  ville: string;

  @Column({ nullable: true })
  quartier?: string;

  @Column()
  telephone: string;

  @Column({ nullable: true })
  email?: string;

  @Column('simple-array', { nullable: true })
  uploadedImages?: string[];

  // Colonne userId pour simplifier
  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.announces, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
