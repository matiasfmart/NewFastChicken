import type { DeliveryType } from '@/lib/types';
import { Home, ShoppingBag, Bike } from 'lucide-react';

export function DeliveryIcon({ type, className }: { type: DeliveryType; className?: string }) {
  switch (type) {
    case 'local':
      return <Home className={className} />;
    case 'takeaway':
      return <ShoppingBag className={className} />;
    case 'delivery':
      return <Bike className={className} />;
    default:
      return null;
  }
}

export function DeliveryTypeSelector({ selected, onSelect }: { selected: DeliveryType, onSelect: (type: DeliveryType) => void}) {
    const types: {id: DeliveryType, label: string, icon: React.ReactNode}[] = [
        { id: 'local', label: 'Comer acá', icon: <Home/> },
        { id: 'takeaway', label: 'Para llevar', icon: <ShoppingBag/> },
        { id: 'delivery', label: 'Delivery', icon: <Bike/> },
    ]
    return (
        <div className="grid grid-cols-3 gap-2">
            {types.map(type => (
                <button 
                    key={type.id} 
                    onClick={() => onSelect(type.id)} 
                    className={`flex flex-col items-center justify-center gap-1 rounded-md border p-2 text-sm transition-colors ${selected === type.id ? 'bg-primary/20 border-primary text-primary-foreground' : 'hover:bg-accent/50'}`}
                >
                    {type.icon}
                    <span>{type.label}</span>
                </button>
            ))}
        </div>
    )
}
