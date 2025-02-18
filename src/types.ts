export interface Guest {
  id: string;
  name: string;
  email: string;
  guests: number;
  confirmation_date: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      guests: {
        Row: Guest;
        Insert: Omit<Guest, 'id' | 'created_at' | 'confirmation_date'>;
        Update: Partial<Omit<Guest, 'id' | 'created_at'>>;
      };
    };
  };
}