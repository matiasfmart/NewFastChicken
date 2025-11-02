export interface CreateInventoryDTO {
  name: string;
  type: 'product' | 'drink' | 'side';
  category?: 'chica' | 'grande';
  price: number;
  stock: number;
}

export interface UpdateInventoryDTO extends Partial<CreateInventoryDTO> {}
