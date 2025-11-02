import type { ComboProduct, DiscountRule } from '@/lib/types';

export interface CreateComboDTO {
  name: string;
  description: string;
  price: number;
  type: 'PO' | 'BG' | 'E' | 'ES' | 'EP';
  products: ComboProduct[];
  discounts?: DiscountRule[];
}

export interface UpdateComboDTO extends Partial<CreateComboDTO> {}
