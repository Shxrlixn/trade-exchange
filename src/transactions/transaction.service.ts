import { 
  Injectable, 
  NotFoundException, 
} from '@nestjs/common'; 
 
import { 
  InjectRepository, 
} from '@nestjs/typeorm'; 
 
import { 
  Repository, 
} from 'typeorm'; 
 
import { 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
} from './entity/transaction.entity'; 
 
import { 
  User, 
} from '../user/entity/user.entity'; 
 
import { 
  Currency, 
} from '../currency/entity/currency.entity'; 
 
@Injectable() 
export class TransactionService { 
 
  constructor( 
 
    @InjectRepository(Transaction) 
    private transactionRepository: 
      Repository<Transaction>, 
 
  ) {} 
 
  // ========================= 
  // CREATE TRANSACTION 
  // ========================= 
 
  async createTransaction( 
    user: User, 
    currency: Currency, 
    amount: number, 
    type: TransactionType, 
    referenceId: number, 
  ): Promise<Transaction> { 
 
    const transaction = 
      this.transactionRepository.create({ 
 
        user, 
        userId: 
          user.id, 
 
        currency, 
        currencyId: 
          currency.id, 
 
        amount, 
        referenceId,    
        type, 
 
        status: 
          null, 
 
        statusCode: 
          null, 
 
        transactionId: 
          '', 
      }); 
 
    const savedTransaction = 
      await this.transactionRepository.save( 
        transaction, 
      ); 
 
    const userIdentifier = 
      user.publicUuid 
        .replace(/-/g, '') 
        .substring(0, 8) 
        .toUpperCase(); 
 
    savedTransaction.transactionId = 
      `TXN-${userIdentifier}-${savedTransaction.id}-${Date.now()}`; 
 
    return await this.transactionRepository.save( 
      savedTransaction, 
    ); 
  } 
 
  // ========================= 
  // UPDATE TRANSACTION STATUS 
  // ========================= 
 
  async updateStatus( 
    transactionId: string, 
    status: TransactionStatus, 
  ): Promise<Transaction> { 
 
    const transaction = 
      await this.findOne( 
        transactionId, 
      ); 
 
    transaction.status = 
      status; 
 
    transaction.statusCode = 
      status === TransactionStatus.CONFIRMED 
        ? 10 
        : 20; 
 
    return await this.transactionRepository.save( 
      transaction, 
    ); 
  } 
 
  // ========================= 
  // FIND TRANSACTIONS BY USER 
  // ========================= 
 
  async findByUser( 
    userId: number, 
  ): Promise<Transaction[]> { 
 
    return await this.transactionRepository.find({ 
      where: { 
        userId, 
      }, 
      order: { 
        createdAt: 
          'DESC', 
      }, 
    }); 
  } 
 
  // ========================= 
  // FIND ONE TRANSACTION 
  // ========================= 
 
  async findOne( 
    transactionId: string, 
  ): Promise<Transaction> { 
 
    const transaction = 
      await this.transactionRepository.findOne({ 
        where: { 
          transactionId, 
        }, 
      }); 
 
    if (!transaction) { 
      throw new NotFoundException( 
        'Transaction not found', 
      ); 
    } 
 
    return transaction; 
  } 
}