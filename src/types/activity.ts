export interface Activity {
  id: string;
  type: string; // Or a more specific union type if you have different activity types
  description: string;
  timestamp: string; // Or Date if you want to store it as a Date object
} 