import { Component } from '@angular/core';
import { Exchange } from './exchange/exchange';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Exchange],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}