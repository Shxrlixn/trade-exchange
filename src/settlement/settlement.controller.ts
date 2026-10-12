import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettlementService } from './settlement.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';

@Controller('settlement')
@UseGuards(JwtAuthGuard)
export class SettlementController {

  constructor(
    private readonly settlementService: SettlementService,
  ) {}

  @Post()
  async createSettlement(
    @Body() createSettlementDto: CreateSettlementDto,
  ) {

    return this.settlementService.createSettlementByApi(
      createSettlementDto.tradeId,
    );

  }
}