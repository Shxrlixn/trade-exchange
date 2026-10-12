import {  
  Injectable,  
  BadRequestException,  
  NotFoundException,  
} from '@nestjs/common';  
  
import {  
  InjectRepository,  
} from '@nestjs/typeorm';  
  
import {  
  Repository,  
  DataSource,  
} from 'typeorm';  
  
import {  
  firstValueFrom,  
} from 'rxjs';  
  
import {  
  HttpService,  
} from '@nestjs/axios';  
  
import {  
  Withdrawal,  
  WithdrawalStatus,  
} from './entity/withdrawal.entity';  
  
import {  
  User,  
} from '../user/entity/user.entity';  
  
import {  
  Currency,  
} from '../currency/entity/currency.entity';  
  
import {  
  Wallet,  
} from '../wallet/entity/wallet.entity';  
  
import {  
  WalletBalance,  
} from '../wallet/entity/wallet-balance.entity';  
  
import {  
  CreateWithdrawalDto,  
} from './dto/create-withdrawal.dto';  
  
import {  
  TransactionService,  
} from '../transactions/transaction.service';  
  
import {  
  TransactionType,  
  TransactionStatus,  
} from '../transactions/entity/transaction.entity';  
  
@Injectable()  
export class WithdrawalService {  
  
  constructor(  
  
    @InjectRepository(Withdrawal)  
    private withdrawalRepository:  
      Repository<Withdrawal>,  
  
    @InjectRepository(User)  
    private userRepository:  
      Repository<User>,  
  
    @InjectRepository(Currency)  
    private currencyRepository:  
      Repository<Currency>,  
  
    @InjectRepository(Wallet)  
    private walletRepository:  
      Repository<Wallet>,  
  
    @InjectRepository(WalletBalance)  
    private walletBalanceRepository:  
      Repository<WalletBalance>,  
  
    private dataSource:  
      DataSource,  
  
    private httpService:  
      HttpService,  
  
    private transactionService:  
      TransactionService,  
  
  ) {}  
  
  // =========================  
  // CREATE WITHDRAWAL  
  // =========================  
  
  async create(  
    createWithdrawalDto: CreateWithdrawalDto,  
    userId: number,  
  ) {  
  
    // =========================  
    // VALIDATE + CREATE  
    // =========================  
  
    const savedData =  
      await this.dataSource.transaction(  
        async (manager) => {  
  
          // =========================  
          // CHECK USER  
          // =========================  
  
          const user =  
            await manager.findOne(User, {  
              where: {  
                id: userId,  
              },  
            });  
  
          if (!user) {  
            throw new NotFoundException(  
              'User not found',  
            );  
          }  
  
          // =========================  
          // CHECK CURRENCY  
          // =========================  
  
          const currency =  
            await manager.findOne(Currency, {  
              where: {  
                id:  
                  createWithdrawalDto.currencyId,  
              },  
            });  
  
          if (!currency) {  
            throw new NotFoundException(  
              'Currency not found',  
            );  
          }  
  
          if (currency.statusCode !== 1) {  
            throw new BadRequestException(  
              'Currency is inactive',  
            );  
          }  
  
          // =========================  
          // FIND USER WALLET  
          // =========================  
  
          const wallet =  
            await manager.findOne(Wallet, {  
              where: {  
                user: {  
                  id: userId,  
                },  
              },  
            });  
  
          if (!wallet) {  
            throw new NotFoundException(  
              'Wallet not found',  
            );  
          }  
  
          // =========================  
          // FIND WALLET BALANCE  
          // =========================  
  
          const walletBalance =  
            await manager.findOne(  
              WalletBalance,  
              {  
                where: {  
                  wallet: {  
                    id: wallet.id,  
                  },  
                  currency: {  
                    id:  
                      createWithdrawalDto.currencyId,  
                  },  
                },  
              },  
            );  
  
          if (!walletBalance) {  
            throw new NotFoundException(  
              'Currency balance not found',  
            );  
          }  
  
          // =========================  
          // CHECK BALANCE  
          // =========================  
  
          if (  
            Number(  
              walletBalance.availableBalance,  
            ) <  
            Number(  
              createWithdrawalDto.amount,  
            )  
          ) {  
            throw new BadRequestException(  
              'Insufficient wallet balance',  
            );  
          }  
  
          // =========================  
          // CREATE WITHDRAWAL  
          // =========================  
  
          const withdrawal =  
            manager.create(Withdrawal);  
  
          // =========================  
          // TEMPORARY NULL  
          // =========================  
  
          withdrawal.withdrawalNumber =  
            null;  
  
          withdrawal.user =  
            user;  
  
          withdrawal.userId =  
            userId;  
  
          withdrawal.transactionId =  
            null;  
  
          withdrawal.currency =  
            currency;  
  
          withdrawal.currencyId =  
            createWithdrawalDto.currencyId;  
  
          withdrawal.currencyName =  
            currency.name;  
  
          withdrawal.amount =  
            createWithdrawalDto.amount;  
  
          // =========================  
          // INITIAL STATUS  
          // =========================  
  
          withdrawal.status =  
            WithdrawalStatus.REJECTED;  
  
          withdrawal.statusCode =  
            20;  
  
          // =========================  
          // FIRST SAVE  
          // =========================  
  
          const savedWithdrawal =  
            await manager.save(  
              Withdrawal,  
              withdrawal,  
            );  
  
          // =========================  
          // GENERATE WITHDRAWAL NUMBER  
          // =========================  
  
          savedWithdrawal.withdrawalNumber =  
            `WDR-${savedWithdrawal.id}`;  
  
          await manager.save(  
            Withdrawal,  
            savedWithdrawal,  
          );  
  
          // =========================  
          // CREATE TRANSACTION  
          // =========================  
  
          const transaction =  
            await this.transactionService.createTransaction(  
              user,  
              currency,  
              createWithdrawalDto.amount,  
              TransactionType.WITHDRAWAL,  
              savedWithdrawal.id,  
            );  
  
          // =========================  
          // SAVE TRANSACTION ID  
          // =========================  
  
          savedWithdrawal.transactionId =  
            transaction.transactionId;  
  
          await manager.save(  
            Withdrawal,  
            savedWithdrawal,  
          );  
  
          return {  
            withdrawal:  
              savedWithdrawal,  
  
            user,  
  
            currency,  
  
            walletId:  
              wallet.id,  
  
            transaction,  
          };  
  
        },  
      );  
  
    // =========================  
    // CALL BANK SERVICE  
    // =========================  
  
    await firstValueFrom(  
      this.httpService.post(  
        'http://localhost:4002/bank/withdrawal',  
        {  
  
          // =========================  
          // USER  
          // =========================  
  
          userId:  
            savedData.user.id,  
  
          // =========================  
          // TRANSACTION  
          // =========================  
  
          transactionId:  
            savedData.transaction.transactionId,  
  
          // =========================  
          // CURRENCY  
          // =========================  
  
          currencyId:  
            savedData.withdrawal.currencyId,  
  
          currencyName:  
            savedData.withdrawal.currencyName,  
  
          // =========================  
          // AMOUNT  
          // =========================  
  
          amount:  
            savedData.withdrawal.amount,  
  
        },  
      ),  
    );  

    // =========================
    // GET UPDATED WITHDRAWAL
    // =========================

    const updatedWithdrawal =
      await this.withdrawalRepository.findOne({
        where: {
          id:
            savedData.withdrawal.id,
        },
      });
  
    // =========================  
    // RETURN RESULT  
    // =========================  
  
    return {  
      transactionId:  
        savedData.transaction.transactionId,  
  
      amount:  
        savedData.withdrawal.amount,  
  
      status:  
        updatedWithdrawal?.status,  
  
      statusCode:  
        updatedWithdrawal?.statusCode,  
    };  
  
  }  
  
  // =========================  
  // HANDLE BANK WEBHOOK  
  // =========================  
  
  async handleWebhook(  
    body: any,  
  ) {  
  
    // =========================  
    // FIND WITHDRAWAL  
    // =========================  
  
    const withdrawal =  
      await this.withdrawalRepository.findOne({  
        where: {  
          transactionId:  
            body.transactionId,  
        },  
      });  
  
    if (!withdrawal) {  
      throw new NotFoundException(  
        'Withdrawal not found',  
      );  
    }  
  
    // =========================  
    // FIND TRANSACTION  
    // =========================  
  
    const transaction =  
      await this.transactionService.findOne(  
        body.transactionId,  
      );  
  
    // =========================  
    // DETERMINE FINAL STATUS  
    // =========================  
  
    const isConfirmed =  
      body.statusCode === 10;  
  
    // =========================  
    // UPDATE WITHDRAWAL  
    // =========================  
  
    withdrawal.status =  
      isConfirmed  
        ? WithdrawalStatus.CONFIRMED  
        : WithdrawalStatus.REJECTED;  
  
    withdrawal.statusCode =  
      isConfirmed  
        ? 10  
        : 20;  
  
    // =========================  
    // UPDATE TRANSACTION  
    // =========================  
  
    await this.transactionService.updateStatus(  
      transaction.transactionId,  
      isConfirmed  
        ? TransactionStatus.CONFIRMED  
        : TransactionStatus.REJECTED,  
    );  
  
    // =========================  
    // UPDATE WITHDRAWAL + WALLET  
    // =========================  
  
    await this.dataSource.transaction(  
      async (manager) => {  
  
        await manager.save(  
          Withdrawal,  
          withdrawal,  
        );  
  
        // =========================  
        // DEDUCT WALLET BALANCE  
        // ONLY IF CONFIRMED  
        // =========================  
  
        if (isConfirmed) {  
  
          const wallet =  
            await manager.findOne(  
              Wallet,  
              {  
                where: {  
                  user: {  
                    id: withdrawal.userId,  
                  },  
                },  
              },  
            );  
  
          if (!wallet) {  
            throw new NotFoundException(  
              'Wallet not found',  
            );  
          }  
  
          const result =  
            await manager  
              .createQueryBuilder()  
              .update(WalletBalance)  
              .set({  
                availableBalance: () =>  
                  `availableBalance - ${Number(  
                    withdrawal.amount,  
                  )}`,  
              })  
              .where(  
                'walletId = :walletId',  
                {  
                  walletId:  
                    wallet.id,  
                },  
              )  
              .andWhere(  
                'currencyId = :currencyId',  
                {  
                  currencyId:  
                    withdrawal.currencyId,  
                },  
              )  
              .andWhere(  
                'availableBalance >= :amount',  
                {  
                  amount:  
                    Number(  
                      withdrawal.amount,  
                    ),  
                },  
              )  
              .andWhere(  
                'rowStatusCode = :rowStatusCode',  
                {  
                  rowStatusCode: 1,  
                },  
              )  
              .execute();  
  
          if (result.affected !== 1) {  
            throw new BadRequestException(  
              'Insufficient wallet balance',  
            );  
          }  
  
        }  
  
      },  
    );  
  
    // =========================  
    // RETURN WEBHOOK RESULT  
    // =========================  
  
    return {  
      transactionId:  
        withdrawal.transactionId,  
  
      status:  
        withdrawal.status,  
  
      statusCode:  
        withdrawal.statusCode,  
    };  
  
  }  
  
}