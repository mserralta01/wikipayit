import { Timestamp } from 'firebase/firestore';
import { Note, Activity } from './merchant';

export type NotesQueryKey = readonly ['notes', string];
export type PhoneCallsQueryKey = readonly ['phone-calls', string];

export interface NoteInput extends Omit<Note, 'createdAt'> {
  createdAt?: Timestamp;
}

export type ActivityQueryKey = {
  queryKey: NotesQueryKey | PhoneCallsQueryKey;
}; 