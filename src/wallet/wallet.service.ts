import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
} from '@nestjs/common'; 
 
import { InjectRepository } from '@nestjs/typeorm'; 
import { 
  EntityManager, 
  Repository, 
} from 'typeorm'; 
 
import { Wallet } from './entity/wallet.entity'; 
import { WalletBalance } from './entity/wallet-balance.entity'; 
 
import { User } from '../user/entity/user.entity'; 
import { Currency } from '../currency/entity/currency.entity'; 
 
@Injectable() 
export class WalletService { 
  constructor( 
    @InjectRepository(Wallet) 
    private walletRepository: Repository<Wallet>, 
 
    @InjectRepository(WalletBalance) 
    private walletBalanceRepository: Repository<WalletBalance>, 
 
    @InjectRepository(User) 
    private userRepository: Repository<User>, 
 
    @InjectRepository(Currency) 
    private currencyRepository: Repository<Currency>, 
  ) {} 
 
  // ========================= 
  // CREATE WALLET 
  // ========================= 
 
  async create(userId: number) { 
    const user = 
      await this.userRepository.findOne({ 
        where: { id: userId }, 
      }); 
 
    if (!user) { 
      throw new NotFoundException( 
        'User not found', 
      ); 
    } 
 
    const existingWallet = 
      await this.walletRepository.findOne({ 
        where: { 
          user: { 
            id: userId, 
          }, 
        }, 
      }); 
 
    if (existingWallet) { 
      throw new BadRequestException( 
        'User already has a wallet', 
      ); 
    } 
 
    const wallet = 
      this.walletRepository.create({ 
        user, 
      }); 
 
    return await this.walletRepository.save( 
      wallet, 
    ); 
  } 
 
  // ========================= 
  // ADD CURRENCY BALANCE 
  // ========================= 
 
  async addCurrency( 
    userId: number, 
    currencyId: number, 
  ) { 
    const wallet = 
      await this.walletRepository.findOne({ 
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
 
    const currency = 
      await this.currencyRepository.findOne({ 
        where: { id: currencyId }, 
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
 
    const existingBalance = 
      await this.walletBalanceRepository.findOne({ 
        where: { 
          wallet: { 
            id: wallet.id, 
          }, 
          currency: { 
            id: currencyId, 
          }, 
        }, 
      }); 
 
    if (existingBalance) { 
      throw new BadRequestException( 
        'Currency already exists in wallet', 
      ); 
    } 
 
    const walletBalance = 
      this.walletBalanceRepository.create({ 
        wallet, 
        currency, 
        currencyId: currency.id, 
        currencyName: currency.name, 
        availableBalance: 0, 
      }); 
 
    return await this.walletBalanceRepository.save( 
      walletBalance, 
    ); 
  } 
 
  // ========================= 
  // GET WALLET 
  // ========================= 
 
  async findWallet(userId: number) { 
    const wallet = 
      await this.walletRepository.findOne({ 
        where: { 
          user: { 
            id: userId, 
          }, 
        }, 
        relations: { 
          balances: { 
            currency: true, 
          }, 
        }, 
      }); 
 
    if (!wallet) { 
      throw new NotFoundException( 
        'Wallet not found', 
      ); 
    } 
 
    return wallet; 
  } 
 
  // ========================= 
  // GET BALANCE 
  // ========================= 
 
  async getBalance( 
    userId: number, 
    currencyId: number, 
  ) { 
    const wallet = 
      await this.walletRepository.findOne({ 
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
 
    const balance = 
      await this.walletBalanceRepository.findOne({ 
        where: { 
          wallet: { 
            id: wallet.id, 
          }, 
          currency: { 
            id: currencyId, 
          }, 
        }, 
      }); 
 
    if (!balance) { 
      throw new NotFoundException( 
        'Currency balance not found', 
      ); 
    } 
 
    return { 
      currencyId: 
        balance.currencyId, 
 
      currencyName: 
        balance.currencyName, 
 
      availableBalance: 
        balance.availableBalance, 
    }; 
  } 
 
  // ========================= 
  // CREDIT 
  // ========================= 
 
  async credit( 
    userId: number, 
    currencyId: number, 
    amount: number, 
    manager?: EntityManager, 
  ) { 
    if (amount <= 0) { 
      throw new BadRequestException( 
        'Amount must be greater than 0', 
      ); 
    } 
 
    const balance = 
      await this.getWalletBalanceEntity( 
        userId, 
        currencyId, 
        manager, 
      ); 
 
    balance.availableBalance = 
      Number(balance.availableBalance) + 
      amount; 
 
    if (manager) { 
      return await manager 
        .getRepository(WalletBalance) 
        .save(balance); 
    } 
 
    return await this.walletBalanceRepository.save( 
      balance, 
    ); 
  } 
 
  // ========================= 
  // DEBIT 
  // ========================= 
 
  async debit( 
    userId: number, 
    currencyId: number, 
    amount: number, 
    manager?: EntityManager, 
  ) { 
    if (amount <= 0) { 
      throw new BadRequestException( 
        'Amount must be greater than 0', 
      ); 
    } 
 
    const balance = 
      await this.getWalletBalanceEntity( 
        userId, 
        currencyId, 
        manager, 
      ); 
 
    if ( 
      Number(balance.availableBalance) < 
      amount 
    ) { 
      throw new BadRequestException( 
        'Insufficient balance', 
      ); 
    } 
 
    balance.availableBalance = 
      Number(balance.availableBalance) - 
      amount; 
 
    if (manager) { 
      return await manager 
        .getRepository(WalletBalance) 
        .save(balance); 
    } 
 
    return await this.walletBalanceRepository.save( 
      balance, 
    ); 
  } 
 
  // ========================= 
  // PRIVATE HELPER 
  // ========================= 
 
  private async getWalletBalanceEntity( 
    userId: number, 
    currencyId: number, 
    manager?: EntityManager, 
  ) { 
    const walletRepository = 
      manager 
        ? manager.getRepository(Wallet) 
        : this.walletRepository; 
 
    const walletBalanceRepository = 
      manager 
        ? manager.getRepository(WalletBalance) 
        : this.walletBalanceRepository; 
 
    const wallet = 
      await walletRepository.findOne({ 
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
 
    const balance = 
      await walletBalanceRepository.findOne({ 
        where: { 
          wallet: { 
            id: wallet.id, 
          }, 
          currency: { 
            id: currencyId, 
          }, 
        }, 
      }); 
 
    if (!balance) { 
      throw new NotFoundException( 
        'Currency balance not found', 
      ); 
    } 
 
    return balance; 
  } 
}