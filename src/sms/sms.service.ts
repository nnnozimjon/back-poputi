import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'querystring';

@Injectable()
export class SmsService {
    constructor(private readonly configService: ConfigService) {}

    async sendSms(phoneNumber: string, message: string): Promise<any> {
        const delimiter = ';';
        const txnId = this.generateTxnId();
        const login = this.configService.get<string>('OSONSMS_LOGIN');
        const sender = this.configService.get<string>('OSONSMS_SENDER');
        const hash = this.configService.get<string>('OSONSMS_HASH');
        const server = this.configService.get<string>('OSONSMS_SERVER');

        const strHash = crypto
            .createHash('sha256')
            .update(
                `${txnId}${delimiter}${login}${delimiter}${sender}${delimiter}${phoneNumber}${delimiter}${hash}`,
            )
            .digest('hex');

        const params = {
            from: sender,
            phone_number: phoneNumber,
            msg: message,
            str_hash: strHash,
            txn_id: txnId,
            login: login,
            is_confidential: true,
        };

        const response = await this.callApi(server, 'GET', params);
        return response;
    }

    private async callApi(
        url: string,
        method: string,
        params: Record<string, any>,
    ): Promise<any> {
        try {
            let response;
            const query = qs.stringify(params);

            if (method === 'GET') {
                response = await axios.get(`${url}?${query}`);
            } else if (method === 'POST') {
                response = await axios.post(url, query, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
            } else if (method === 'PUT') {
                response = await axios.put(url, query, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                });
            } else if (method === 'DELETE') {
                response = await axios.delete(`${url}?${query}`);
            } else {
                throw new Error('Unknown HTTP method');
            }

            if (response.data?.error) {
                return {
                    error: 1,
                    msg: `Error Code: ${response.data.error.code}, Message: ${response.data.error.msg}`,
                };
            }

            return {
                error: 0,
                msg: response.data,
            };
        } catch (err) {
            return {
                error: 1,
                msg: err.message || 'Unknown error',
            };
        }
    }

    private generateTxnId(): string {
        return crypto.randomUUID().replace(/-/g, '');
    }
}
