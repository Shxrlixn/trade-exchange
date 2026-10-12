import {

  Module,

} from '@nestjs/common';

import {

  BankWebhookController,

} from './bank-webhook.controller';

import {

  DepositModule,

} from '../../deposit/deposit.module';

import {

  WithdrawalModule,

} from '../../withdrawal/withdrawal.module';

@Module({

  imports: [

    DepositModule,

    WithdrawalModule,

  ],

  controllers: [

    BankWebhookController,

  ],

})

export class BankWebhookModule {}