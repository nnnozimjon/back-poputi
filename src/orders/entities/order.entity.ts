import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_phone: string;

  @Column()
  user_id: string;

  @Column('simple-array')
  seat_ids: number[];

  @Column()
  trip_id: string;

  @Column('decimal', { scale: 2 })
  total_price: number;

  @Column({ default: 'pending' })
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'success';

  @Column({ nullable: true })
  invoice_id?: string;

  @Column({ nullable: true })
  transaction_id?: string;

  @Column({ nullable: true })
  gate?: string;

  @Column({ nullable: true })
  pay_date?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
