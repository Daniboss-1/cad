export interface VendorData {
  sku: string;
  price: number;
  stock: number;
  leadTime: string;
  vendor: string;
}

const MOCK_VENDORS = ['McMaster-Carr', 'DigiKey', 'Mouser', 'Misumi'];

export async function fetchVendorStatus(sku: string): Promise<VendorData> {
  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 800));

  // Determinstic mock data based on SKU
  const hash = sku.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    sku,
    price: (hash % 100) + 0.99,
    stock: hash % 500,
    leadTime: hash % 7 === 0 ? '4 weeks' : '2 days',
    vendor: MOCK_VENDORS[hash % MOCK_VENDORS.length]
  };
}
