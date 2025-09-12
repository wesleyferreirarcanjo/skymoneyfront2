// Queue Types
export interface QueueEntry {
  id: string;
  position: number;
  donation_number: number;
  is_receiver: boolean;
  passed_user_ids: string[];
  user_id: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateQueueEntryRequest {
  position: number;
  donation_number: number;
  user_id: string | null;
  is_receiver: boolean;
  passed_user_ids: string[];
}

export interface UpdateQueueEntryRequest {
  position?: number;
  donation_number?: number;
  is_receiver?: boolean;
  passed_user_ids?: string[];
}

export interface ReorderQueueRequest {
  id: string;
  position: number;
}
