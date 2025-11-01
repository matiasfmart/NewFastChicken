
import type { InventoryItem, Combo } from './types';

// THIS FILE IS NOW DEPRECATED FOR MOST OF THE APP.
// DATA IS FETCHED FROM FIRESTORE.
// It's kept for reference and potential fallbacks.

export const products: InventoryItem[] = [
  { id: 'p1', type: 'product', name: 'Pata de pollo', price: 800, stock: 100 },
  { id: 'p2', type: 'product', name: 'Pechuga', price: 1000, stock: 80 },
  { id: 'p3', type: 'product', name: 'Alitas', price: 600, stock: 150 },
  { id: 'p4', type: 'product', name: 'Suprema', price: 1200, stock: 60 },
  { id: 'p5', type: 'product', name: 'Hamburguesa', price: 1500, stock: 90 },
];

export const drinks: InventoryItem[] = [
  { id: 'd1', type: 'drink', name: 'Coca Cola', price: 350, stock: 200, category: 'chica' },
  { id: 'd2', type: 'drink', name: 'Sprite', price: 350, stock: 200, category: 'chica' },
  { id: 'd3', type: 'drink', name: 'Fanta', price: 350, stock: 180, category: 'chica' },
  { id: 'd4', type: 'drink', name: 'Jugo Naranja', price: 380, stock: 150, category: 'chica' },
  { id: 'd5', type: 'drink', name: 'Coca Cola 1L', price: 900, stock: 100, category: 'grande' },
  { id: 'd6', type: 'drink', name: 'Sprite 1L', price: 900, stock: 100, category: 'grande' },
];

export const sides: InventoryItem[] = [
  { id: 's1', type: 'side', name: 'Papas fritas', price: 700, stock: 250 },
  { id: 's2', type: 'side', name: 'Arroz', price: 600, stock: 120 },
  { id: 's3', type: 'side', name: 'Ensalada', price: 650, stock: 100 },
  { id: 's4', type: 'side', name: 'Puré', price: 600, stock: 80 },
];

export const inventory: InventoryItem[] = [...products, ...drinks, ...sides];

export const combos: Combo[] = [
  {
    id: 'PO1',
    type: 'PO',
    name: 'Combo Pollo Clásico',
    description: '2 presas + bebida + guarnición',
    price: 3500,
    products: [
      { productId: 'p1', quantity: 2 },
      { productId: 'd1', quantity: 1 },
      { productId: 's1', quantity: 1 },
    ],
    discounts: [
        { id: 'dr1', type: 'weekday', value: '3', percentage: 15 } // 15% off on Wednesdays
    ]
  },
  {
    id: 'PO2',
    type: 'PO',
    name: 'Combo Alitas',
    description: '6 alitas + bebida + guarnición',
    price: 4200,
    products: [
      { productId: 'p3', quantity: 6 },
      { productId: 'd2', quantity: 1 },
      { productId: 's1', quantity: 1 },
    ],
  },
  {
    id: 'BG1',
    type: 'BG',
    name: 'Combo Hamburguesa',
    description: 'Hamburguesa + bebida + guarnición',
    price: 4500,
    products: [
      { productId: 'p5', quantity: 1 },
      { productId: 'd1', quantity: 1 },
      { productId: 's1', quantity: 1 },
    ],
    discounts: [
        { id: 'dr2', type: 'weekday', value: '5', percentage: 20 } // 20% off on Fridays
    ]
  },
  // Individual items as combos are now deprecated by this change,
  // but kept for compatibility. They won't be customizable in the cashier view.
  {
    id: 'D',
    type: 'E',
    name: 'Bebidas Chicas',
    description: 'Bebida individual chica (350ml)',
    price: 350,
    products: [],
  },
  {
    id: 'DG',
    type: 'E',
    name: 'Bebidas Grandes',
    description: 'Bebida individual grande (1L+)',
    price: 900,
    products: [],
  }
];

    