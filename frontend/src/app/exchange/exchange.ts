
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Side = 'buy' | 'sell';
type OrderType = 'limit' | 'market';
type BookTab = 'book' | 'trades';
type BottomTab = 'open' | 'history' | 'funds';

interface MarketPair {
  symbol: string;
  base: string;
  quote: string;
  name: string;
  price: number;
  change: number;
  high: number;
  low: number;
  volume: string;
  icon: string;
}

interface BookOrder {
  price: number;
  amount: number;
  total: number;
}

interface RecentTrade {
  price: number;
  amount: number;
  time: string;
  side: Side;
}

interface Candle {
  x: number;
  y: number;
  h: number;
  open: number;
  close: number;
  high: number;
  low: number;
  up: boolean;
}

@Component({
  selector: 'app-exchange',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exchange.html',
  styleUrl: './exchange.scss',
})
export class Exchange implements OnInit, OnDestroy {
  readonly Math = Math;

  activeSide: Side = 'buy';
  orderType: OrderType = 'limit';
  activeTimeframe = '15m';
  activeBookTab: BookTab = 'book';
  activeBottomTab: BottomTab = 'open';

  chartExpanded = false;
  orderBookExpanded = false;
  showMobileNav = false;
  showChartIndicators = false;

  selectedPair = 'BTC/USDT';
  price = 82510.10;
  quantity = 0;

  availableUsdt = 10000;
  availableBase = 0.1215;

  // Backward compatibility with your existing HTML.
  get availableBalance(): number {
    return this.availableUsdt;
  }

  notice = '';
  connectionStatus = 'Demo mode';

  // Set this to your actual backend WebSocket URL.
  // Empty means the component runs with demo data.
  marketSocketUrl = '';

  private socket?: WebSocket;

  readonly timeframes = ['1m', '5m', '15m', '30m', '1H', '4H', '1D'];
  readonly percentages = [0, 25, 50, 75, 100];

  marketPairs: MarketPair[] = [
    {
      symbol: 'BTC/USDT',
      base: 'BTC',
      quote: 'USDT',
      name: 'Bitcoin',
      price: 82510.10,
      change: 2.45,
      high: 83283.28,
      low: 80393.56,
      volume: '1,298.84 BTC',
      icon: '₿',
    },
    {
      symbol: 'ETH/USDT',
      base: 'ETH',
      quote: 'USDT',
      name: 'Ethereum',
      price: 3180.50,
      change: 1.32,
      high: 3244.90,
      low: 3098.20,
      volume: '18,421.60 ETH',
      icon: '◆',
    },
  ];

  sellOrders: BookOrder[] = [
    { price: 82547.23, amount: 0.007, total: 577.83 },
    { price: 82546.98, amount: 0.0306, total: 2523.94 },
    { price: 82546.95, amount: 0.07, total: 5778.29 },
    { price: 82546.62, amount: 0.1064, total: 8781.56 },
    { price: 82546.61, amount: 0.0782, total: 6456.14 },
    { price: 82546.56, amount: 0.012, total: 990.56 },
    { price: 82546.02, amount: 0.0281, total: 2319.52 },
    { price: 82545.78, amount: 0.0175, total: 1444.55 },
  ];

  buyOrders: BookOrder[] = [
    { price: 82505.73, amount: 1.2077, total: 99605.19 },
    { price: 82505.72, amount: 0.0212, total: 1749.12 },
    { price: 82505.71, amount: 0.013, total: 1072.57 },
    { price: 82505.48, amount: 0.114, total: 9405.62 },
    { price: 82505.25, amount: 0.05, total: 4125.26 },
    { price: 82505.10, amount: 0.082, total: 6765.42 },
    { price: 82504.95, amount: 0.023, total: 1897.61 },
    { price: 82504.72, amount: 0.041, total: 3382.69 },
  ];

  recentTrades: RecentTrade[] = [
    { price: 82510.10, amount: 0.024, time: '12:30:42', side: 'buy' },
    { price: 82509.80, amount: 0.018, time: '12:30:40', side: 'sell' },
    { price: 82511.20, amount: 0.051, time: '12:30:37', side: 'buy' },
    { price: 82508.50, amount: 0.012, time: '12:30:33', side: 'sell' },
    { price: 82512.00, amount: 0.032, time: '12:30:29', side: 'buy' },
    { price: 82510.40, amount: 0.019, time: '12:30:24', side: 'buy' },
  ];

  // Illustrative candles only; these are not live market candles.
  readonly chartCandles: Candle[] = [
    { x: 28, y: 242, h: 33, open: 275, close: 242, high: 225, low: 294, up: true },
    { x: 62, y: 242, h: 13, open: 242, close: 255, high: 225, low: 270, up: false },
    { x: 96, y: 214, h: 41, open: 255, close: 214, high: 198, low: 270, up: true },
    { x: 130, y: 214, h: 16, open: 214, close: 230, high: 193, low: 249, up: false },
    { x: 164, y: 184, h: 46, open: 230, close: 184, high: 170, low: 248, up: true },
    { x: 198, y: 184, h: 18, open: 184, close: 202, high: 158, low: 218, up: false },
    { x: 232, y: 160, h: 42, open: 202, close: 160, high: 144, low: 224, up: true },
    { x: 266, y: 160, h: 14, open: 160, close: 174, high: 138, low: 194, up: false },
    { x: 300, y: 132, h: 42, open: 174, close: 132, high: 116, low: 194, up: true },
    { x: 334, y: 132, h: 15, open: 132, close: 147, high: 108, low: 164, up: false },
    { x: 368, y: 112, h: 35, open: 147, close: 112, high: 92, low: 166, up: true },
    { x: 402, y: 112, h: 14, open: 112, close: 126, high: 88, low: 146, up: false },
    { x: 436, y: 90, h: 36, open: 126, close: 90, high: 72, low: 146, up: true },
    { x: 470, y: 90, h: 18, open: 90, close: 108, high: 65, low: 126, up: false },
    { x: 504, y: 108, h: 24, open: 108, close: 132, high: 94, low: 153, up: false },
    { x: 538, y: 118, h: 14, open: 132, close: 118, high: 101, low: 151, up: true },
    { x: 572, y: 118, h: 27, open: 118, close: 145, high: 101, low: 166, up: false },
    { x: 606, y: 145, h: 13, open: 145, close: 158, high: 128, low: 181, up: false },
    { x: 640, y: 139, h: 19, open: 158, close: 139, high: 119, low: 175, up: true },
    { x: 674, y: 139, h: 27, open: 139, close: 166, high: 123, low: 191, up: false },
  ];

  get selectedMarket(): MarketPair {
    return this.marketPairs.find(
      market => market.symbol === this.selectedPair
    ) ?? this.marketPairs[0];
  }

  get baseAsset(): string {
    return this.selectedMarket?.base ?? '';
  }

  get quoteAsset(): string {
    return this.selectedMarket?.quote ?? '';
  }

  get currentPrice(): number {
    return this.selectedMarket?.price ?? this.price;
  }

  get total(): number {
    const effectivePrice =
      this.orderType === 'market' ? this.currentPrice : this.price;

    return this.quantity * effectivePrice;
  }

  get maxQuantity(): number {
    if (this.activeSide === 'buy') {
      const effectivePrice =
        this.orderType === 'market' ? this.currentPrice : this.price;

      return effectivePrice > 0
        ? this.availableUsdt / effectivePrice
        : 0;
    }

    return this.availableBase;
  }

  get canSubmitDemoOrder(): boolean {
    if (!Number.isFinite(this.quantity) || this.quantity <= 0) {
      return false;
    }

    if (this.activeSide === 'buy') {
      return this.total > 0 && this.total <= this.availableUsdt;
    }

    return this.quantity <= this.availableBase;
  }

  ngOnInit(): void {
    if (this.marketSocketUrl.trim()) {
      this.connectMarketSocket(this.marketSocketUrl);
    }
  }

  ngOnDestroy(): void {
    this.socket?.close();
  }

  connectMarketSocket(url: string): void {
    this.socket?.close();

    try {
      this.socket = new WebSocket(url);
      this.connectionStatus = 'Connecting';

      this.socket.onopen = () => {
        this.connectionStatus = 'Connected';

        this.sendSocketMessage({
          type: 'subscribe',
          channel: 'markets',
        });

        this.subscribeSelectedPair();
      };

      this.socket.onmessage = event => {
        try {
          this.handleSocketMessage(JSON.parse(event.data));
        } catch {
          console.error('Invalid market WebSocket message.');
        }
      };

      this.socket.onerror = () => {
        this.connectionStatus = 'Connection error';
      };

      this.socket.onclose = () => {
        this.connectionStatus = 'Disconnected';
      };
    } catch {
      this.connectionStatus = 'Connection error';
    }
  }

  private sendSocketMessage(message: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private subscribeSelectedPair(): void {
    this.sendSocketMessage({
      type: 'subscribe',
      channel: 'market',
      symbol: this.selectedPair,
    });
  }

  private handleSocketMessage(message: any): void {
    if (!message || typeof message.type !== 'string') {
      return;
    }

    const data = message.data;

    switch (message.type) {
      case 'markets': {
        if (!Array.isArray(data)) return;

        const markets: MarketPair[] = data
          .filter(item =>
            item &&
            typeof item.symbol === 'string' &&
            typeof item.base === 'string' &&
            typeof item.quote === 'string' &&
            Number.isFinite(Number(item.price))
          )
          .map(item => ({
            symbol: item.symbol,
            base: item.base,
            quote: item.quote,
            name: item.name ?? item.base,
            price: Number(item.price),
            change: Number(item.change ?? 0),
            high: Number(item.high ?? item.price),
            low: Number(item.low ?? item.price),
            volume: String(item.volume ?? '—'),
            icon: item.icon ?? '●',
          }));

        if (!markets.length) return;

        this.marketPairs = markets;

        if (!markets.some(market => market.symbol === this.selectedPair)) {
          this.selectedPair = markets[0].symbol;
        }

        this.price = this.selectedMarket.price;
        break;
      }

      case 'ticker': {
        if (!data || data.symbol !== this.selectedPair) return;

        const market = this.marketPairs.find(
          item => item.symbol === data.symbol
        );

        if (!market) return;

        if (Number.isFinite(Number(data.price))) {
          market.price = Number(data.price);
        }

        if (Number.isFinite(Number(data.change))) {
          market.change = Number(data.change);
        }

        if (Number.isFinite(Number(data.high))) {
          market.high = Number(data.high);
        }

        if (Number.isFinite(Number(data.low))) {
          market.low = Number(data.low);
        }

        if (data.volume !== undefined) {
          market.volume = String(data.volume);
        }

        if (this.orderType === 'market') {
          this.price = market.price;
        }

        break;
      }

      case 'orderbook': {
        if (!data || data.symbol !== this.selectedPair) return;

        if (Array.isArray(data.asks)) {
          this.sellOrders = this.mapBookOrders(data.asks);
        }

        if (Array.isArray(data.bids)) {
          this.buyOrders = this.mapBookOrders(data.bids);
        }

        break;
      }

      case 'trades': {
        if (
          !data ||
          data.symbol !== this.selectedPair ||
          !Array.isArray(data.trades)
        ) {
          return;
        }

        this.recentTrades = data.trades
          .map((trade: any): RecentTrade => ({
            price: Number(trade.price),
            amount: Number(trade.amount),
            time: String(trade.time ?? ''),
            side: trade.side === 'sell' ? 'sell' : 'buy',
          }))
          .filter((trade: RecentTrade) =>
            Number.isFinite(trade.price) &&
            Number.isFinite(trade.amount)
          );

        break;
      }
    }
  }

  private mapBookOrders(orders: any[]): BookOrder[] {
    return orders
      .map((order: any): BookOrder => {
        const price = Number(order.price);
        const amount = Number(order.amount);

        return {
          price,
          amount,
          total: Number(order.total ?? price * amount),
        };
      })
      .filter((order: BookOrder) =>
        Number.isFinite(order.price) &&
        Number.isFinite(order.amount) &&
        Number.isFinite(order.total)
      );
  }

  selectSide(side: Side): void {
    this.activeSide = side;
    this.quantity = 0;
    this.notice = '';
  }

  selectPair(symbol: string): void {
    const market = this.marketPairs.find(
      item => item.symbol === symbol
    );

    if (!market) return;

    this.selectedPair = symbol;
    this.price = market.price;
    this.quantity = 0;
    this.notice = '';

    this.subscribeSelectedPair();
  }

  selectTimeframe(timeframe: string): void {
    this.activeTimeframe = timeframe;
  }

  setPercentage(percent: number): void {
    this.quantity = Number(
      (this.maxQuantity * percent / 100).toFixed(6)
    );

    this.notice = '';
  }

  onPriceChange(value: number | string): void {
    const parsed = Number(value);

    this.price =
      Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  onQuantityChange(value: number | string): void {
    const parsed = Number(value);

    this.quantity =
      Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;

    this.notice = '';
  }

  toggleChartExpanded(): void {
    this.chartExpanded = !this.chartExpanded;

    if (this.chartExpanded) {
      this.orderBookExpanded = false;
    }
  }

  toggleOrderBookExpanded(): void {
    this.orderBookExpanded = !this.orderBookExpanded;

    if (this.orderBookExpanded) {
      this.chartExpanded = false;
    }
  }

  setBookTab(tab: BookTab): void {
    this.activeBookTab = tab;
  }

  setBottomTab(tab: BottomTab): void {
    this.activeBottomTab = tab;
  }

  submitDemoOrder(): void {
    if (this.quantity <= 0) {
      this.notice = 'Enter a quantity greater than zero.';
      return;
    }

    if (this.activeSide === 'buy' && this.total > this.availableUsdt) {
      this.notice = `Insufficient ${this.quoteAsset} demo balance.`;
      return;
    }

    if (this.activeSide === 'sell' && this.quantity > this.availableBase) {
      this.notice = `Insufficient ${this.baseAsset} demo balance.`;
      return;
    }

    this.notice =
      `Demo validation passed: ${this.activeSide.toUpperCase()} ` +
      `${this.quantity.toFixed(6)} ${this.baseAsset}. ` +
      'No order was submitted.';
  }
}
