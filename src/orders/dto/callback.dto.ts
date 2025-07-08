import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';

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


    @IsEnum(['ok', 'failed', 'canceled', 'pending', 'success'])
    status: 'ok' | 'failed' | 'canceled' | 'pending' | 'success';

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
    @IsNotEmpty()
    pay_date: string; 

    @IsString()
    @IsNotEmpty()
    sign: string; 
}