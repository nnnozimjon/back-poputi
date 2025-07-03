export class CallbackDto {
    orderId: string;
    transactionId: string;
    status: 'failed' | 'pending' | 'canceled' | 'ok';
    token: string;
    amount: number;
    account: string;
    transaction_type: string;
}