import { Timestamp } from 'firebase/firestore';

export interface CardRates {
  percentage: number;
  transactionFee: number;
}

export interface InterchangeRates {
  id: string;
  visaMastercardDiscover: CardRates;
  americanExpress: CardRates;
  lastUpdated: Timestamp;
  updatedBy: string;
} 