export interface Table {
  id: number;
  number: number;
  capacity: number;
  position_x: number;
  position_y: number;
  is_available: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTableRequest {
  number: number;
  capacity: number;
  position_x: number;
  position_y: number;
  is_available: boolean;
}

export interface UpdateTableRequest {
  number?: number;
  capacity?: number;
  position_x?: number;
  position_y?: number;
  is_available?: boolean;
  is_active?: boolean;
}

export interface UpdateTablePositionRequest {
  position_x: number;
  position_y: number;
}