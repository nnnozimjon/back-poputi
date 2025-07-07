import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';

export class CallbackDto {
    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsString()
    @IsNotEmpty()
    transactionId: string;

    @IsEnum(['failed', 'pending', 'canceled', 'ok', 'success'])
    status: 'failed' | 'pending' | 'canceled' | 'ok' | 'success';

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