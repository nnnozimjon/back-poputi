import { PayoutMethod } from "src/payout-methods/entities/payout-method.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'user_payouts' })
export class UserPayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @Column({ nullable: false })
  payoutMethodId: string;   

  @Column({ nullable: false })
  phone_number: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => PayoutMethod, (payoutMethod) => payoutMethod.userPayouts)
  payoutMethod: PayoutMethod;

  @ManyToOne(() => User, (user) => user.userPayouts)
  user: User;
}