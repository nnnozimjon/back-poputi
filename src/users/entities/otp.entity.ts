import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'otps' })
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string; // Email or phone number

  @Column()
  otp: string;

  @CreateDateColumn()
  createdAt: Date; // Timestamp for expiration check
}
