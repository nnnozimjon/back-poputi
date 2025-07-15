import { UserPayout } from 'src/user-payouts/entities/user-payouts.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity({ name: 'payout_methods' })
export class PayoutMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  name: string;

  @OneToMany(() => UserPayout, (userPayout) => userPayout.payoutMethod)
  userPayouts: UserPayout[];
} 