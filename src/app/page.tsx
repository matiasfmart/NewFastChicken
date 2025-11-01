
import * as React from "react";
import type { Combo, InventoryItem } from "@/lib/types";
import { getCombos } from "@/services/comboService";
import { getInventoryItems } from "@/services/inventoryService";
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/lib/firebase-config';
import { CashierClientPage } from "@/components/cashier/CashierClientPage";

// Server-side data fetching
async function getMenuData() {
  let firebaseApp;
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  const db = getFirestore(firebaseApp);
  
  try {
    const combos = await getCombos(db);
    const inventory = await getInventoryItems(db);
    return { combos, inventory };
  } catch (error) {
    console.error("Failed to fetch menu data:", error);
    // Return empty arrays on error to prevent crashing the page
    return { combos: [], inventory: [] };
  }
}

export default async function Home() {
    const { combos, inventory } = await getMenuData();
    
    return (
      <CashierClientPage combos={combos} inventory={inventory} />
    );
}
