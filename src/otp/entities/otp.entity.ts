import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
  } from 'typeorm';
  
  @Entity('otps')
  export class Otp {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    code: string;
  
    @Column()
    target: string;
  
    @Column()
    type: string;
  
    @Column()
    expiresAt: Date;
  }
  