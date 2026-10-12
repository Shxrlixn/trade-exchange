import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  firstValueFrom,
} from 'rxjs';

import {
  HttpService,
} from '@nestjs/axios';

import {
  BankPayment,
  BankPaymentStatus,
} from './entity/bank-payment.entity';

import {
  CreatePaymentDto,
} from './dto/create-payment.dto';

import {
  CreateWithdrawalDto,
} from './dto/create-withdrawal.dto';

@Injectable()
export class BankService {

  constructor(

    @InjectRepository(BankPayment)
    private bankPaymentRepository:
      Repository<BankPayment>,

    private httpService:
      HttpService,

  ) {}

  // =========================
  // CREATE PAYMENT
  // =========================

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ) {

    // =========================
    // CHECK EXISTING PAYMENT
    // =========================

    const existingPayment =
      await this.bankPaymentRepository.findOne({
        where: {
          transactionId:
            createPaymentDto.transactionId,
        },
      });

    if (existingPayment) {
      throw new ConflictException(
        'Payment already exists',
      );
    }

    // =========================
    // GENERATE PAYMENT ID
    // =========================

    const paymentId =
      `PAY-${Date.now()}-${Math.floor(
        Math.random() * 1000,
      )}`;

    // =========================
    // BANK DECIDES RESULT
    // =========================

    const status =
      BankPaymentStatus.CONFIRMED;

    const statusCode =
      10;

    // =========================
    // CREATE BANK PAYMENT
    // =========================

    const payment =
      this.bankPaymentRepository.create({

        paymentId,

        userId:
          createPaymentDto.userId,

        transactionId:
          createPaymentDto.transactionId,

        amount:
          createPaymentDto.amount,

        status,

        statusCode,

      });

    const savedPayment =
      await this.bankPaymentRepository.save(
        payment,
      );

    // =========================
    // SEND WEBHOOK
    // =========================

    await firstValueFrom(
      this.httpService.post(
        'http://localhost:4000/bank/webhook',
        {

          transactionId:
            savedPayment.transactionId,

          type:
            'DEPOSIT',

          status:
            savedPayment.status,

          statusCode:
            savedPayment.statusCode,

        },
      ),
    );

    // =========================
    // RETURN RESULT
    // =========================

    return {

      paymentId:
        savedPayment.paymentId,

      transactionId:
        savedPayment.transactionId,

      amount:
        savedPayment.amount,

      status:
        savedPayment.status,

      statusCode:
        savedPayment.statusCode,

    };
  }

  // =========================
  // CREATE WITHDRAWAL
  // =========================

  async createWithdrawal(
    createWithdrawalDto:
      CreateWithdrawalDto,
  ) {

    // =========================
    // BANK DECIDES RESULT
    // =========================

    const status =
      'CONFIRMED';

    const statusCode =
      10;

    // =========================
    // SEND WEBHOOK
    // =========================

    await firstValueFrom(
      this.httpService.post(
        'http://localhost:4000/bank/webhook',
        {

          transactionId:
            createWithdrawalDto.transactionId,

          type:
            'WITHDRAWAL',

          status,

          statusCode,

        },
      ),
    );

    // =========================
    // RETURN RESULT
    // =========================

    return {

      transactionId:
        createWithdrawalDto.transactionId,

      amount:
        createWithdrawalDto.amount,

      status,

      statusCode,

    };
  }
}