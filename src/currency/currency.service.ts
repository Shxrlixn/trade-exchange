import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Currency } from './entity/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyStatusDto } from './dto/update-currency-status.dto';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) {}

  // =========================
  // CREATE CURRENCY
  // =========================

  async create(
    createCurrencyDto: CreateCurrencyDto,
  ) {
    // Check if currency code already exists
    const existingCurrency =
      await this.currencyRepository.findOne({
        where: {
          code: createCurrencyDto.code,
        },
      });

    if (existingCurrency) {
      throw new BadRequestException(
        'Currency code already exists',
      );
    }

    // Create currency
    const currency =
      this.currencyRepository.create({
        code: createCurrencyDto.code,
        name: createCurrencyDto.name,
        symbol: createCurrencyDto.symbol,

        statusCode: 1,
        status: 'Active',
      });

    return await this.currencyRepository.save(
      currency,
    );
  }

  // =========================
  // GET ALL CURRENCIES
  // =========================

  async findAll() {
    return await this.currencyRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  // =========================
  // UPDATE CURRENCY STATUS
  // =========================

  async updateStatus(
    id: number,
    updateStatusDto: UpdateCurrencyStatusDto,
  ) {
    const currency =
      await this.currencyRepository.findOne({
        where: {
          id,
        },
      });

    if (!currency) {
      throw new BadRequestException(
        'Currency not found',
      );
    }

    if (updateStatusDto.statusCode === 1) {
      currency.statusCode = 1;
      currency.status = 'Active';
    } else {
      currency.statusCode = 2;
      currency.status = 'Inactive';
    }

    return await this.currencyRepository.save(
      currency,
    );
  }
}