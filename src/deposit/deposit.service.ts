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
  Deposit,  
  DepositStatus,  
} from './entity/deposit.entity';  
  
import {  
  User,  
} from '../user/entity/user.entity';  

import {
  firstValueFrom,
} from 'rxjs';

import {
  HttpService,
} from '@nestjs/axios';
  
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
  CreateDepositDto,  
} from './dto/create-deposit.dto';  
  
import {  
  TransactionService,  
} from '../transactions/transaction.service';  
  
import {  
  TransactionType,  
  TransactionStatus,  
} from '../transactions/entity/transaction.entity';  
  
@Injectable()  
export class DepositService {  
  
  constructor(  

    private httpService:
      HttpService,
  
    @InjectRepository(Deposit)  
    private depositRepository:  
      Repository<Deposit>,  
  
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
  
    private transactionService:  
      TransactionService,  
  
  ) {}  
  
  // =========================  
  // CREATE DEPOSIT  
  // =========================  
  
  async create(  
    createDepositDto: CreateDepositDto,  
    userId: number,  
  ) {  
  
    // =========================  
    // CREATE DEPOSIT AND WALLET  
    // =========================  
  
    const savedDeposit =  
      await this.dataSource.transaction(  
        async (manager) => {  
  
          // =========================  
          // FIND USER  
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
          // FIND CURRENCY  
          // =========================  
  
          const currency =  
            await manager.findOne(Currency, {  
              where: {  
                id: createDepositDto.currencyId,  
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
          // FIND OR CREATE WALLET  
          // =========================  
  
          let wallet =  
            await manager.findOne(Wallet, {  
              where: {  
                user: {  
                  id: userId,  
                },  
              },  
            });  
  
          if (!wallet) {  
  
            wallet =  
              manager.create(Wallet, {  
                user,  
              });  
  
            await manager.save(  
              Wallet,  
              wallet,  
            );  
  
          }  
  
          // =========================  
          // FIND OR CREATE WALLET BALANCE  
          // =========================  
  
          let walletBalance =  
            await manager.findOne(  
              WalletBalance,  
              {  
                where: {  
                  wallet: {  
                    id: wallet.id,  
                  },  
                  currency: {  
                    id: createDepositDto.currencyId,  
                  },  
                },  
              },  
            );  
  
          if (!walletBalance) {  
  
            walletBalance =  
              manager.create(  
                WalletBalance,  
                {  
                  wallet,  
                  currency,  
                  currencyId:  
                    currency.id,  
                  currencyName:  
                    currency.name,  
                  availableBalance: 0,  
                },  
              );  
  
            await manager.save(  
              WalletBalance,  
              walletBalance,  
            );  
  
          }  
  
          // =========================  
          // CREATE DEPOSIT  
          // =========================  
  
          const deposit =  
            manager.create(  
              Deposit,  
              {  
                user,  
                userId,  
  
                currency,  
                currencyId:  
                  createDepositDto.currencyId,  
  
                currencyName:  
                  currency.name,  
  
                amount:  
                  createDepositDto.amount,  
  
                status: null,  
  
                statusCode: null,  
              },  
            );  
  
          const createdDeposit =  
            await manager.save(  
              Deposit,  
              deposit,  
            );  
  
          // =========================  
          // GENERATE DEPOSIT NUMBER  
          // =========================  
  
          createdDeposit.depositNumber =  
            `DEP-${createdDeposit.id}`;  
  
          await manager.save(  
            Deposit,  
            createdDeposit,  
          );  
  
          return {  
            deposit: createdDeposit,  
            user,  
            currency,  
            wallet,  
            walletBalance,  
          };  
  
        },  
      );  
  
    // =========================  
    // CREATE TRANSACTION  
    // =========================  
  
    const transaction =  
      await this.transactionService.createTransaction(  
        savedDeposit.user,  
        savedDeposit.currency,  
        savedDeposit.deposit.amount,  
        TransactionType.DEPOSIT,  
        savedDeposit.deposit.id,  
      );  
  
    // =========================  
    // SAVE TRANSACTION ID  
    // =========================  
  
    savedDeposit.deposit.transactionId =  
      transaction.transactionId;  
  
    await this.depositRepository.save(  
      savedDeposit.deposit,  
    );  

    // =========================
    // CALL BANK SERVICE
    // =========================

    await firstValueFrom(
      this.httpService.post(
        'http://localhost:4002/bank/payment',
        {

          // =========================
          // USER
          // =========================

          userId:
            savedDeposit.user.id,

          userPublicUuid:
            savedDeposit.user.publicUuid,

          // =========================
          // TRANSACTION
          // =========================

          transactionId:
            transaction.transactionId,

          // =========================
          // AMOUNT
          // =========================

          amount:
            savedDeposit.deposit.amount,

        },
      ),
    );

    // =========================
    // GET UPDATED DEPOSIT
    // =========================

    const updatedDeposit =
      await this.depositRepository.findOne({
        where: {
          id:
            savedDeposit.deposit.id,
        },
      });
  
    // =========================  
    // RETURN PENDING DATA  
    // =========================  
  
    return {  
      deposit: {  
        depositNumber:  
          savedDeposit.deposit.depositNumber,  
  
        transactionId:  
          transaction.transactionId,  
  
        amount:  
          savedDeposit.deposit.amount,  
  
        currencyId:  
          savedDeposit.currency.id,  
  
        currencyCode:  
          savedDeposit.currency.code,  
  
        status:  
          updatedDeposit?.status,  
  
        statusCode:  
          updatedDeposit?.statusCode,  
      },  
    };  
  }  
  
  // =========================  
  // HANDLE BANK WEBHOOK  
  // =========================  
  
  async handleWebhook(  
    body: any,  
  ) {  
  
    // =========================  
    // FIND DEPOSIT  
    // =========================  
  
    const deposit =  
      await this.depositRepository.findOne({  
        where: {  
          transactionId:  
            body.transactionId,  
        },  
      });  
  
    if (!deposit) {  
      throw new NotFoundException(  
        'Deposit not found',  
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
    // UPDATE DEPOSIT  
    // =========================  
  
    deposit.status =  
      isConfirmed  
        ? DepositStatus.CONFIRMED  
        : DepositStatus.REJECTED;  
  
    deposit.statusCode =  
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
    // UPDATE DEPOSIT + WALLET  
    // =========================  
  
    await this.dataSource.transaction(  
      async (manager) => {  
  
        await manager.save(  
          Deposit,  
          deposit,  
        );  
  
        // =========================  
        // CREDIT WALLET BALANCE  
        // ATOMIC INCREMENT  
        // =========================  
  
        if (isConfirmed) {  
  
          const wallet =  
            await manager.findOne(  
              Wallet,  
              {  
                where: {  
                  user: {  
                    id: deposit.userId,  
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
                  `availableBalance + ${Number(  
                    deposit.amount,  
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
                    deposit.currencyId,  
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
            throw new NotFoundException(  
              'Wallet balance not found',  
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
        deposit.transactionId,  
  
      status:  
        deposit.status,  
  
      statusCode:  
        deposit.statusCode,  
  
    };  
  }  
  
}