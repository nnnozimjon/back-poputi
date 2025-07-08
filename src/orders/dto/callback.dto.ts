import { IsString, IsEnum, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CallbackDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsString()
    @IsNotEmpty()
    transactionId: string;

    @IsEnum(['failed', 'pending', 'canceled', 'ok',])
    status: 'failed' | 'pending' | 'canceled' | 'ok';

    @IsString()
    @IsNotEmpty()
    token: string;

    @IsNumber()
    amount: number;

    @IsString()
    @IsNotEmpty()
    account: string;

    @IsString()
    @IsNotEmpty()
    transaction_type: string;
}

export class DcCallbackDto { 
    @IsString()
    @IsNotEmpty()
    merchant: string;	 

    @IsString()
    @IsNotEmpty()
    order_id: string; 

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsEnum(['Failed', 'Pending', 'Canceled', 'Paid',])
    @IsOptional()
    status: 'Failed' | 'Pending' | 'Canceled' | 'Paid';

    @IsString()
    @IsNotEmpty()
    currency: string; 

    @IsString()
    @IsNotEmpty()
    payer: string; 

    @IsString()
    @IsNotEmpty()
    payid: string; 

    @IsString()
    @IsOptional()
    pay_date: string; 

    @IsString()
    @IsNotEmpty()
    sign: string; 
}