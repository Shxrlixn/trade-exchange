import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { CurrencyService } from './currency.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyStatusDto } from './dto/update-currency-status.dto';

@Controller('currency')
@UseGuards(JwtAuthGuard)
export class CurrencyController {
  constructor(
    private readonly currencyService: CurrencyService,
  ) {}

  // =========================
  // CREATE CURRENCY
  // =========================

  @Post()
  create(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ) {
    return this.currencyService.create(
      createCurrencyDto,
    );
  }

  // =========================
  // GET ALL CURRENCIES
  // =========================

  @Get()
  findAll() {
    return this.currencyService.findAll();
  }

  // =========================
  // UPDATE CURRENCY STATUS
  // =========================

  @Patch('/:id/status')
  updateStatus(
    @Param('id') id: number,
    @Body()
    updateStatusDto: UpdateCurrencyStatusDto,
  ) {
    return this.currencyService.updateStatus(
      id,
      updateStatusDto,
    );
  }
}