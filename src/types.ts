
export type UUID = string;

export interface User { id: UUID; handle: string; created_at: string; }
export interface Creator { id: UUID; handle: string; display_name?: string; }
export interface Product { id: UUID; creator_id: UUID; title: string; description?: string; price_cents: number; }
export interface Drop { id: UUID; product_id: UUID; creator_id: UUID; start_time: string; end_time: string; initial_stock: number; low_stock_threshold: number; status: string; }
export interface Order { id: UUID; user_id: UUID; product_id: UUID; drop_id: UUID; qty: number; amount_cents: number; status: string; idempotency_key: string; }
