import React, { useState, useEffect, useMemo } from 'react';
import * as Lucide from 'lucide-react';

// --- Interfaces for Type Safety ---
interface Product {
  id: string;
  name: string;
  type: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  unitName: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  kecamatan: string;
  kelurahan: string;
  address: string;
  role: string;
}

interface TransactionItem {
  productId: string;
  name: string;
  quantity: number;
  sellPrice: number;
  costPrice: number;
}

interface Transaction {
  id: string;
  timestamp: number;
  type: 'sale' | 'expense';
  amount: number;
  cost?: number;
  category: string;
  notes: string;
  paymentMethod?: string;
  customerName?: string;
  items?: TransactionItem[];
}

// --- Custom Lucide Icon Mapper ---
function Icon({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) {
  const mapper: Record<string, keyof typeof Lucide> = {
    Dollar: 'DollarSign',
    Package: 'Package',
    History: 'History',
    Plus: 'Plus',
    Minus: 'Minus',
    Trash: 'Trash2',
    Search: 'Search',
    Refresh: 'RefreshCw',
    Check: 'Check',
    FileText: 'FileText',
    ShoppingBag: 'ShoppingBag',
    ChevronRight: 'ChevronRight',
    ChevronDown: 'ChevronDown',
    User: 'User',
    Users: 'Users',
    X: 'X',
    Printer: 'Printer',
    Share2: 'Share2',
    Phone: 'Phone',
    Sliders: 'Sliders',
    Download: 'Download',
    Upload: 'Upload',
    Alert: 'AlertTriangle'
  };

  const Resolved = mapper[name] || 'HelpCircle';
  const IconComponent = Lucide[Resolved] as React.ComponentType<{ size: number; className?: string }>;
  return IconComponent ? <IconComponent size={size} className={className} /> : null;
}

// --- Helper Formatting Utilities ---
const formatCurrency = (val: number) => {
  return 'Rp ' + Math.abs(val).toLocaleString('id-ID');
};

const cleanCustomerName = (name: string) => {
  if (!name) return '';
  return name.replace(/^(agen|depot|mitra|toko)\s+/i, '');
};

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${hours}:${minutes}`;
};

// --- Static Seed Core Datasets ---
const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Pak Budi', phone: '0812-3456-7890', kecamatan: 'Biringkanaya', kelurahan: 'Daya', address: 'Jl. Perintis Kemerdekaan KM 12 No. 5', role: 'agen' },
  { id: 'c2', name: 'Toko Berkah Utama', phone: '0852-1122-3344', kecamatan: 'Rappocini', kelurahan: 'Kassi-Kassi', address: 'Minasa Upa Blok AB4 No. 12', role: 'pelanggan' },
  { id: 'c3', name: 'Argus Cabang Sudirman', phone: '0813-9988-7766', kecamatan: 'Ujung Pandang', kelurahan: 'Mangkura', address: 'Jl. Jend. Sudirman No. 45', role: 'agen' },
  { id: 'c4', name: 'Restoran Nelayan', phone: '0811-4455-6677', kecamatan: 'Tamalate', kelurahan: 'Maccini Sombala', address: 'Jl. Metro Tanjung Bunga Ruko No. 8', role: 'pelanggan' },
  { id: 'c5', name: 'Pak RW 05', phone: '0853-4400-9988', kecamatan: 'Panakkukang', kelurahan: 'Masale', address: 'Perumahan Masale Permai Blok D7', role: 'pelanggan' },
  { id: 'c6', name: 'Toko Kelontong Indah', phone: '0821-8877-6655', kecamatan: 'Biringkanaya', kelurahan: 'Pai', address: 'Jl. Goa Ria No. 24', role: 'pelanggan' },
  { id: 'c7', name: 'Kopkar Makmur', phone: '0812-7766-5544', kecamatan: 'Rappocini', kelurahan: 'Banta-Bantaeng', address: 'Kawasan KBN Kav. 14', role: 'pelanggan' },
  { id: 'c8', name: 'Kantor Lurah', phone: '0811-1234-5678', kecamatan: 'Panakkukang', kelurahan: 'Pampang', address: 'Jl. Pampang Raya No. 1A', role: 'pelanggan' }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Galon Refill (Air Argus) 19L', type: 'galon', costPrice: 10000, sellPrice: 13000, stock: 85, minStock: 25, unitName: 'Galon' },
  { id: 'p2', name: 'Galon Kosong Argus 19L', type: 'galon', costPrice: 25000, sellPrice: 35000, stock: 32, minStock: 12, unitName: 'Galon' },
  { id: 'p3', name: 'Galon Baru (Air Argus) 19L', type: 'galon', costPrice: 35000, sellPrice: 50000, stock: 20, minStock: 5, unitName: 'Galon' }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', timestamp: Date.now() - 6 * 24 * 3600 * 1000, type: 'sale', amount: 144000, cost: 100000, category: 'Penjualan', notes: 'Kirim Kantor Lurah', paymentMethod: 'cash', customerName: 'Kantor Lurah', items: [{ productId: 'p1', name: 'Galon Refill (Air Argus) 19L', quantity: 8, sellPrice: 18000, costPrice: 13000 }] },
  { id: 'tx-2', timestamp: Date.now() - 4 * 24 * 3600 * 1000, type: 'sale', amount: 165000, cost: 120000, category: 'Penjualan', notes: 'Paket resto nelayan', paymentMethod: 'transfer', customerName: 'Restoran Nelayan', items: [{ productId: 'p3', name: 'Galon Baru (Air Argus) 19L', quantity: 3, sellPrice: 55000, costPrice: 42000 }] },
  { id: 'tx-3', timestamp: Date.now() - 2 * 24 * 3600 * 1000, type: 'expense', amount: 45000, category: 'Bensin & Operasional', notes: 'Bensin Sol Truk' },
  { id: 'tx-4', timestamp: Date.now() - 50 * 60 * 1000, type: 'sale', amount: 65000, cost: 50000, category: 'Penjualan', notes: 'Harian Budi', paymentMethod: 'cash', customerName: 'Pak Budi', items: [{ productId: 'p1', name: 'Galon Refill (Air Argus) 19L', quantity: 5, sellPrice: 13000, costPrice: 10000 }] }
];

export default function App() {
  // Main dynamic state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem('ARG_PRODUCTS');
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem('ARG_TX');
      return stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const stored = localStorage.getItem('ARG_CUST');
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Core parameters persistence
  const [targetRumah, setTargetRumah] = useState(() => {
    const val = localStorage.getItem('TGT_RUMAH');
    return val ? parseInt(val) : 100;
  });
  const [targetGalon, setTargetGalon] = useState(() => {
    const val = localStorage.getItem('TGT_GALON');
    return val ? parseInt(val) : 100;
  });
  
  // POS Form State
  const [posType, setPosType] = useState('sale'); // 'sale' or 'expense'
  const [selectedCustId, setSelectedCustId] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({ p1: 0, p2: 0, p3: 0 });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [posNotes, setPosNotes] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Bensin & Operasional');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Catalog Form State
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', type: 'galon', costPrice: '', sellPrice: '', stock: '', minStock: '', unitName: 'Galon' });

  // Customer Add State
  const [showAddCustomerDrawer, setShowAddCustomerDrawer] = useState(false);
  const [quickCust, setQuickCust] = useState({ name: '', phone: '', kecamatan: 'Biringkanaya', kelurahan: '', address: '', role: 'pelanggan' });

  // Interactive overlays
  const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [selectedReportCustomer, setSelectedReportCustomer] = useState<Customer | null>(null);
  const [alert, setAlert] = useState<string | null>(null);

  // LocalStorage sync watchers
  useEffect(() => { localStorage.setItem('ARG_PRODUCTS', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('ARG_TX', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('ARG_CUST', JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem('TGT_RUMAH', targetRumah.toString()); }, [targetRumah]);
  useEffect(() => { localStorage.setItem('TGT_GALON', targetGalon.toString()); }, [targetGalon]);

  // Flash notification
  const triggerAlert = (msg: string) => {
    setAlert(msg);
    setTimeout(() => setAlert(null), 3000);
  };

  // Business Ledger logic aggregators
  const financialSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalExpense = 0;

    transactions.forEach(tx => {
      if (tx.type === 'sale') {
        totalRevenue += tx.amount;
        totalCost += (tx.cost || 0);
      } else if (tx.type === 'expense') {
        totalExpense += tx.amount;
      }
    });

    const netProfit = totalRevenue - totalCost - totalExpense;
    return { totalRevenue, totalCost, totalExpense, netProfit };
  }, [transactions]);

  // Daily Chart aggregation logic (Dynamic Canvas representation)
  const chartData = useMemo(() => {
    const result: Array<{ label: string; rawDate: string; revenue: number; cost: number; expense: number; netProfit: number }> = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = `${d.getDate()}  ${['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][d.getMonth()]}`;
      result.push({ label, rawDate: d.toDateString(), revenue: 0, cost: 0, expense: 0, netProfit: 0 });
    }

    transactions.forEach(tx => {
      const txDateStr = new Date(tx.timestamp).toDateString();
      const matchingDay = result.find(d => d.rawDate === txDateStr);
      if (matchingDay) {
        if (tx.type === 'sale') {
          matchingDay.revenue += tx.amount;
          matchingDay.cost += (tx.cost || 0);
        } else {
          matchingDay.expense += tx.amount;
        }
      }
    });

    result.forEach(d => {
      d.netProfit = d.revenue - d.cost - d.expense;
    });

    return result;
  }, [transactions]);

  // POS Submission Logic
  const handlePOSSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (posType === 'sale') {
      const customer = customers.find(c => c.id === selectedCustId);
      if (!customer) return triggerAlert('Silakan pilih salah satu konsumen!');

      const items: TransactionItem[] = [];
      let totalAmount = 0;
      let totalCost = 0;

      // Check items requested
      Object.keys(quantities).forEach(pId => {
        const qty = quantities[pId] || 0;
        if (qty > 0) {
          const product = products.find(p => p.id === pId);
          if (product) {
            items.push({
              productId: pId,
              name: product.name,
              quantity: qty,
              sellPrice: product.sellPrice,
              costPrice: product.costPrice
            });
            totalAmount += qty * product.sellPrice;
            totalCost += qty * product.costPrice;
          }
        }
      });

      if (items.length === 0) return triggerAlert('Masukkan kuantitas belanja minimal 1 barang!');

      // Calculate Stock rollback logic & swaps empty galons
      const updatedProducts = products.map(p => {
        const buyQty = quantities[p.id] || 0;
        let newStock = p.stock - buyQty;

        // Rule: Refill Air Argus (p1) is bought -> automatically generates empty empty galon swap to stock
        if (p.id === 'p1' && quantities['p1'] > 0) {
          // No adjustment need, logic applies swap to empty penampungan p2
        }
        if (p.id === 'p2' && quantities['p1'] > 0) {
          const swapEmptyQty = quantities['p1'] || 0;
          newStock += swapEmptyQty; 
        }

        return { ...p, stock: Math.max(0, newStock) };
      });

      setProducts(updatedProducts);

      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        timestamp: Date.now(),
        type: 'sale',
        amount: totalAmount,
        cost: totalCost,
        category: 'Penjualan',
        notes: posNotes || 'Distribusi galon air bersih',
        paymentMethod,
        customerName: customer.name,
        items
      };

      setTransactions([newTx, ...transactions]);
      setSelectedReceipt(newTx);
      setQuantities({ p1: 0, p2: 0, p3: 0 });
      setSelectedCustId('');
      setPosNotes('');
      triggerAlert('Penjualan dicatat serta stok berhasil disinkronkan!');
    } else {
      // Expense POS Mode
      const extAmt = parseInt(expenseAmount) || 0;
      if (extAmt <= 0) return triggerAlert('Ketik jumlah rupiah pengeluaran yang valid!');

      const newTx: Transaction = {
        id: 'tx-' + Date.now(),
        timestamp: Date.now(),
        type: 'expense',
        amount: extAmt,
        category: expenseCategory,
        notes: posNotes || 'Biaya operasional kas'
      };

      setTransactions([newTx, ...transactions]);
      setExpenseAmount('');
      setPosNotes('');
      triggerAlert('Data operational expense sukses dimasukkan!');
    }
  };

  // Transaction removal rolls back product stocks harian
  const handleDeleteTransaction = (tx: Transaction) => {
    if (!window.confirm('Batalkan transaksi ini? Stok produk yang berkurang akan dikembalikan ke gudang otomatis.')) return;

    if (tx.type === 'sale' && tx.items) {
      const updatedProducts = products.map(p => {
        const soldItem = tx.items?.find(it => it.productId === p.id);
        const soldQty = soldItem ? soldItem.quantity : 0;
        let newStock = p.stock + soldQty;

        // Swap empty rollback air refill (p1)
        if (p.id === 'p2') {
          const p1SoldItem = tx.items?.find(it => it.productId === 'p1');
          const p1SoldQty = p1SoldItem ? p1SoldItem.quantity : 0;
          newStock -= p1SoldQty; // deduct empty count
        }

        return { ...p, stock: Math.max(0, newStock) };
      });
      setProducts(updatedProducts);
    }

    setTransactions(transactions.filter(t => t.id !== tx.id));
    triggerAlert('Transaksi telah dibatalkan & stock direstore!');
  };

  // Group customers by Kecamatan to compile grouped accordion tree
  const customersByKecamatan = useMemo(() => {
    const mapping: Record<string, Record<string, Customer[]>> = {};
    customers.forEach(c => {
      const kec = c.kecamatan || 'Umum';
      if (!mapping[kec]) mapping[kec] = {};
      
      const kel = c.kelurahan || 'Lainnya';
      if (!mapping[kec][kel]) mapping[kec][kel] = [];
      
      mapping[kec][kel].push(c);
    });
    return mapping;
  }, [customers]);

  return (
    <div className="flex-1 flex flex-col pb-16 min-h-screen">
      
      {/* BRAND TOP HEADER (Navy Dark #0B1528) */}
      <header className="bg-navy text-white px-6 py-5 shadow-md flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Icon name="ShoppingBag" size={18} className="text-sky-400" />
          </div>
          <div>
            <h1 className="font-heading font-black text-lg tracking-tight uppercase leading-none">DISTRIBUTOR AIR ARGUS</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">CV. Tirta Kebaikan</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] bg-sky-500/20 text-sky-300 font-bold px-2 py-1 rounded-full border border-sky-400/20 uppercase tracking-widest">
            PRO POS v2
          </span>
        </div>
      </header>

      {/* Toast Notifications Banner */}
      {alert && (
        <div className="px-5 py-3.5 bg-sky-600 text-white font-medium text-xs text-center shadow-lg transition-transform sticky top-0 z-40 flex items-center justify-center gap-2">
          <Icon name="Check" size={14} />
          <span>{alert}</span>
        </div>
      )}

      {/* PRIMARY CONTENT TAB-PANELS COMPILER */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        
        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Financial stats panel (Slate-800 & Slate-500 optimized contrast pairs, Inter/Jkt fonts) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="border-r border-slate-100/80 pr-4 last:border-0 last:pr-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Omset Penjualan</span>
                <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-1">{formatCurrency(financialSummary.totalRevenue)}</h2>
                <span className="text-[9px] text-emerald-500 font-medium flex items-center gap-0.5 mt-1 font-heading">
                  ▲ 100% Volume Jual
                </span>
              </div>

              <div className="border-r border-slate-100/80 pr-4 last:border-0 last:pr-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Operasional Expense</span>
                <h2 className="font-heading font-extrabold text-2xl text-slate-800 mt-1">{formatCurrency(financialSummary.totalExpense)}</h2>
                <span className="text-[9px] text-rose-500 font-medium flex items-center gap-0.5 mt-1 font-heading">
                  ▼ Biaya Operasional
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Untung Bersih (Net Profit)</span>
                <h2 className="font-heading font-black text-3xl text-emerald-600 mt-1">{formatCurrency(financialSummary.netProfit)}</h2>
                <span className="text-[9px] text-slate-500 font-medium mt-1 block">
                  Setelah dipotong Harga Modal Pokok
                </span>
              </div>

            </div>

            {/* INTERACTIVE CUSTOM CHANNELS CHART (SVG Rendered) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-heading font-bold text-slate-800 text-sm">Fluktuasi Kinerja Keuangan</h3>
                  <p className="text-[10px] text-slate-500">Agregat transaksi harian operasional (Omset vs Laba)</p>
                </div>
                <div className="flex gap-4 text-[9px] font-bold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-500 inline-block"></span> Omset</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Net Laba</span>
                </div>
              </div>

              {/* Custom SVG line compiler charts */}
              <div className="relative h-48 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
                  {/* Grid horizontal guidelines */}
                  <line x1="0" y1="30" x2="700" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1="90" x2="700" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
                  <line x1="0" y1="150" x2="700" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

                  {/* Chart Points Plotter */}
                  {(() => {
                    const maxVal = Math.max(...chartData.map(d => Math.max(d.revenue, d.netProfit, 100000))) || 200000;
                    const pointsRevenue = chartData.map((d, idx) => {
                      const x = (idx / 6) * 700;
                      const y = 170 - (d.revenue / maxVal) * 140;
                      return `${x},${y}`;
                    }).join(' ');

                    const pointsProfit = chartData.map((d, idx) => {
                      const x = (idx / 6) * 700;
                      const y = 170 - (d.netProfit / maxVal) * 140;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <React.Fragment>
                        {/* Area shading */}
                        <polygon points={`0,170 ${pointsRevenue} 700,170`} fill="url(#gradRevenue)" opacity="0.1" />
                        <polygon points={`0,170 ${pointsProfit} 700,170`} fill="url(#gradProfit)" opacity="0.1" />

                        {/* Trend paths */}
                        <polyline fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" points={pointsRevenue} />
                        <polyline fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" points={pointsProfit} />

                        {/* Interactive small indicator dots */}
                        {chartData.map((d, idx) => {
                          const x = (idx / 6) * 700;
                          const yRev = 170 - (d.revenue / maxVal) * 140;
                          const yProf = 170 - (d.netProfit / maxVal) * 140;
                          return (
                            <g key={idx}>
                              <circle cx={x} cy={yRev} r="4" fill="#2563eb" className="cursor-pointer" />
                              <circle cx={x} cy={yProf} r="4" fill="#10b981" className="cursor-pointer" />
                              <text x={x} y="178" fontSize="8" fill="#64748b" textAnchor="middle" className="font-heading font-semibold">{d.label}</text>
                            </g>
                          );
                        })}
                      </React.Fragment>
                    );
                  })()}

                  {/* SVG Def gradients definition */}
                  <defs>
                    <linearGradient id="gradRevenue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#fff" />
                    </linearGradient>
                    <linearGradient id="gradProfit" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#fff" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Stock & Target indicators section (Slate & Plus Jakarta fonts pairing) */}
            <div>
              <h3 className="font-heading font-bold text-slate-800 text-sm mb-3">Laporan Persediaan Gudang & Target</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Box Refill */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Galon Refill</span>
                    <span className="text-[10px] text-sky-600 font-semibold block mt-0.5">Air Argus 19 Liter</span>
                  </div>
                  <div className="mt-4">
                    <span className="font-heading font-extrabold text-2xl text-slate-800">{products[0]?.stock || 0}</span>
                    <span className="text-[10px] text-slate-500 font-medium ml-1">Galon</span>
                    
                    <div className="mt-2 text-[8px] text-slate-500 flex justify-between font-heading font-bold">
                      <span>Max: 150</span>
                      <span>{Math.round(((products[0]?.stock || 0) / 150) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.round(((products[0]?.stock || 0) / 150) * 100))}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Box Galon Kosong */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Galon Kosong</span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Penampungan Swaps</span>
                  </div>
                  <div className="mt-4">
                    <span className="font-heading font-extrabold text-2xl text-slate-800">{products[1]?.stock || 0}</span>
                    <span className="text-[10px] text-slate-500 font-medium ml-1">Galon</span>
                    
                    <div className="mt-2 text-[8px] text-slate-500 flex justify-between font-heading font-bold">
                      <span>Max: 100</span>
                      <span>{Math.round(((products[1]?.stock || 0) / 100) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.round(((products[1]?.stock || 0) / 100) * 100))}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Target Rumah */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Pelanggan Rumah</span>
                    <span className="text-[10px] text-purple-600 font-semibold block mt-0.5">Target Capaian KK</span>
                  </div>
                  <div className="mt-4">
                    <span className="font-heading font-extrabold text-2xl text-slate-800">
                      {55 + Math.max(0, customers.filter(c => c.role === 'pelanggan').length)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium ml-1">KK</span>
                    
                    <div className="mt-2 text-[8px] text-slate-500 flex justify-between font-heading font-bold">
                      <span>Goal: {targetRumah}</span>
                      <span>{Math.round(((55 + Math.max(0, customers.filter(c => c.role === 'pelanggan').length)) / targetRumah) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                      <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.round(((55 + Math.max(0, customers.filter(c => c.role === 'pelanggan').length)) / targetRumah) * 100))}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Target Galon */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Mitra Toko/Depot</span>
                    <span className="text-[10px] text-pink-600 font-semibold block mt-0.5">Target Capaian Toko</span>
                  </div>
                  <div className="mt-4">
                    <span className="font-heading font-extrabold text-2xl text-slate-800">
                      {72 + Math.max(0, customers.filter(c => c.role === 'agen').length)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium ml-1">Gerai</span>
                    
                    <div className="mt-2 text-[8px] text-slate-500 flex justify-between font-heading font-bold">
                      <span>Goal: {targetGalon}</span>
                      <span>{Math.round(((72 + Math.max(0, customers.filter(c => c.role === 'agen').length)) / targetGalon) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1">
                      <div className="bg-pink-600 h-full rounded-full" style={{ width: `${Math.min(100, Math.round(((72 + Math.max(0, customers.filter(c => c.role === 'agen').length)) / targetGalon) * 100))}%` }}></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* TARGET CONTROLLER KEY ACTION BUTTON */}
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setShowTargetModal(true)}
                className="bg-navy hover:opacity-90 text-white font-heading font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <Icon name="Sliders" size={13} className="text-sky-300" />
                <span>Konfigurasi Target Capaian</span>
              </button>
            </div>

            {/* ADMIN UTILITY ACTIONS CARD */}
            <div className="bg-slate-100/50 rounded-2xl p-5 border border-slate-200/50">
              <h4 className="font-heading font-bold text-slate-800 text-xs mb-1.5">Administrative POS Utilities</h4>
              <p className="text-[10px] text-slate-500 mb-4">Lakukan wiping data lokal atau restore ke seed data awal secara cepat dan aman.</p>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => {
                    if (window.confirm('Restore system ke seed dan demodata default awal? Ini akan mengganti transaksi Anda.')) {
                      setProducts(INITIAL_PRODUCTS);
                      setTransactions(INITIAL_TRANSACTIONS);
                      setCustomers(INITIAL_CUSTOMERS);
                      triggerAlert('Database berhasil direstore ke kondisi demo asli!');
                    }
                  }}
                  className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 font-medium text-[10.5px] px-3.5 py-2 rounded-lg shadow-2xs transition flex items-center gap-1.5"
                >
                  <Icon name="Refresh" size={12} />
                  <span>Mulai Ulang Demo Data</span>
                </button>

                <button 
                  onClick={() => {
                    if (window.confirm('PERINGATAN: Kosongkan database sepenuhnya? Seluruh data penjualan dan pelanggan akan hilang.')) {
                      setProducts(INITIAL_PRODUCTS.map(p => ({ ...p, stock: 0 })));
                      setTransactions([]);
                      setCustomers([]);
                      triggerAlert('Seluruh database lokal berhasil dihapus!');
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 font-medium text-[10.5px] px-3.5 py-2 rounded-lg transition"
                >
                  Hapus Penuh Database Pelanggan & POS
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 2. CASHIER VIEW (KASIR POS) */}
        {activeTab === 'kasir' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="font-heading font-bold text-slate-800 text-sm">Operator POS Register</h3>
              <p className="text-[10px] text-slate-500">Formulir pengumpulan omset atau pengeluaran biaya berkala harian CV. Tirta Kebaikan</p>
            </div>

            {/* Sale or Expense Selector */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl">
              <button 
                type="button" 
                onClick={() => setPosType('sale')}
                className={`py-2 rounded-lg text-xs font-bold font-heading transition-all ${posType === 'sale' ? 'bg-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Penjualan Lapangan (Sale)
              </button>
              <button 
                type="button" 
                onClick={() => setPosType('expense')}
                className={`py-2 rounded-lg text-xs font-bold font-heading transition-all ${posType === 'expense' ? 'bg-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-800'}`}
              >
                Catat Biaya (Expense)
              </button>
            </div>

            <form onSubmit={handlePOSSubmit} className="space-y-4">
              {posType === 'sale' ? (
                <div className="space-y-4">
                  
                  {/* Pick Customer dropdown + quick add customer inline button */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Pilih Pelanggan / Agen Terdaftar</label>
                    <div className="flex gap-2">
                      <select 
                        value={selectedCustId} 
                        onChange={e => setSelectedCustId(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-slate-300 focus:outline-none"
                      >
                        <option value="">-- Cari Nama Pembeli --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.kecamatan} - {c.role === 'agen' ? 'Agen' : 'Konsumen'})
                          </option>
                        ))}
                      </select>
                      
                      <button 
                        type="button"
                        onClick={() => setShowAddCustomerDrawer(true)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-semibold text-xs px-3.5 rounded-xl transition border border-slate-200"
                      >
                        + Baru
                      </button>
                    </div>
                  </div>

                  {/* Quantities Slider Input for each of the 3 key products */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Kuantitas Produk Jual</label>
                    
                    {products.map(p => (
                      <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150 gap-2">
                        <div>
                          <h4 className="font-heading font-bold text-xs text-slate-800">{p.name}</h4>
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            Stok Gudang: <span className="font-bold">{p.stock}</span> {p.unitName} | Harga Jual: {formatCurrency(p.sellPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button 
                            type="button"
                            onClick={() => setQuantities({ ...quantities, [p.id]: Math.max(0, (quantities[p.id] || 0) - 1) })}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition active:scale-95"
                          >
                            <Icon name="Minus" size={12} />
                          </button>
                          <input 
                            type="number"
                            min="0"
                            placeholder="0"
                            value={quantities[p.id] || ''}
                            onChange={e => setQuantities({ ...quantities, [p.id]: parseInt(e.target.value) || 0 })}
                            className="w-16 h-8 text-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                          />
                          <button 
                            type="button"
                            onClick={() => setQuantities({ ...quantities, [p.id]: Math.min(p.stock, (quantities[p.id] || 0) + 1) })}
                            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition active:scale-95"
                          >
                            <Icon name="Plus" size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Swap automatic Empty Galon note */}
                  <div className="bg-sky-50 rounded-2xl p-3 border border-sky-100/50 flex items-start gap-2.5">
                    <Icon name="Alert" size={14} className="text-sky-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-sky-800 leading-relaxed font-medium">
                      <strong>Sistem Swaps Aktif:</strong> Setiap penjualan <strong className="text-sky-900 underline">Galon Refill</strong> otomatis meningkatkan stok penampungan <strong className="text-sky-900 underline">Galon Kosong (Empty Swap)</strong> di database ketika Anda menyimpan transaksi.
                    </p>
                  </div>

                  {/* Payment system and Notes layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Metode Pembayaran</label>
                      <select 
                        value={paymentMethod} 
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-300"
                      >
                        <option value="cash">Tunai / Cash</option>
                        <option value="transfer">Transfer Bank (BCA / CIMB)</option>
                        <option value="credit">Hutang (BON Karyawan)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Catatan Logistik Penjualan</label>
                      <input 
                        type="text"
                        placeholder="Contoh: Titip di garasi depan"
                        value={posNotes}
                        onChange={e => setPosNotes(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-slate-300"
                      />
                    </div>
                  </div>

                </div>
              ) : (
                /* EXPENSE INPUT MODULE */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori Pengeluaran</label>
                      <select 
                        value={expenseCategory}
                        onChange={e => setExpenseCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                      >
                        <option value="Bensin & Operasional">Bensin & Operasional</option>
                        <option value="Konsumsi">Konsumsi</option>
                        <option value="Peralatan & Refill">Peralatan & Refill</option>
                        <option value="Gaji Karyawan">Gaji Karyawan</option>
                        <option value="Sewa Tempat">Sewa Tempat</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Input Jumlah Biaya (Rp)</label>
                      <input 
                        type="number"
                        placeholder="Contoh: 75000"
                        value={expenseAmount}
                        onChange={e => setExpenseAmount(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Spesifikasi Detail Pengeluaran</label>
                    <input 
                      type="text"
                      placeholder="Contoh: Konsumsi makan sopir ekspedisi"
                      value={posNotes}
                      onChange={e => setPosNotes(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-navy hover:opacity-90 text-white font-heading font-bold text-xs py-3.5 rounded-xl shadow-xs transition uppercase active:scale-[0.98] mt-2 block"
              >
                Simpan Transaksi Ke Database POS
              </button>
            </form>
          </div>
        )}

        {/* 3. PRODUCTS LIST VIEW */}
        {activeTab === 'produk' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div>
                <h3 className="font-heading font-bold text-slate-800 text-sm">Gerbang Kontrol Katalog</h3>
                <p className="text-[10px] text-slate-500">Sesuaikan modal awal, harga jual konsumen, serta monitoring kuota stok gudang rill.</p>
              </div>
              <button 
                onClick={() => {
                  setNewProduct({ name: '', type: 'galon', costPrice: '', sellPrice: '', stock: '', minStock: '', unitName: 'Galon' });
                  setShowProductModal(true);
                }}
                className="bg-navy text-white text-[11px] font-heading font-semibold px-4 py-2 rounded-xl"
              >
                + Katalog Baru
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {products.map(p => {
                const isDepleted = p.stock <= p.minStock;
                const totalUnitMargin = p.sellPrice - p.costPrice;

                return (
                  <div key={p.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${isDepleted ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                          {isDepleted ? 'Stok Kritis' : 'Normal'}
                        </span>
                        
                        <button 
                          onClick={() => {
                            if (window.confirm(`Yakin ingin meniadakan katalog "${p.name}"? Data penjualan lampau akan dipertahankan.`)) {
                              setProducts(products.filter(item => item.id !== p.id));
                              triggerAlert('Katalog produk dihapus!');
                            }
                          }}
                          className="text-slate-355 hover:text-rose-600 transition p-1"
                          title="Delete Catalog item"
                        >
                          <Icon name="Trash" size={13} />
                        </button>
                      </div>

                      <h4 className="font-heading font-bold text-slate-800 text-xs mt-3">{p.name}</h4>
                      <p className="text-[9.5px] text-slate-500 mt-1">Jenis Satuan: {p.type} ({p.unitName})</p>

                      <div className="grid grid-cols-2 gap-2 text-slate-800 mt-4 border-t border-b border-slate-50 py-3">
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase block tracking-wide font-medium">Harga Modal</span>
                          <span className="font-heading font-extrabold text-xs">{formatCurrency(p.costPrice)}</span>
                        </div>
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase block tracking-wide font-medium">Harga Jual</span>
                          <span className="font-heading font-extrabold text-xs text-blue-600">{formatCurrency(p.sellPrice)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2">
                      {/* Stock instant quick editor counter adjustment */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-medium">Stok Saat Ini:</span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => {
                              const updated = products.map(item => item.id === p.id ? { ...item, stock: Math.max(0, item.stock - 5) } : item);
                              setProducts(updated);
                              triggerAlert('Stok dikurangi 5 unit!');
                            }}
                            className="px-2 py-0.5 font-bold bg-slate-100 hover:bg-slate-200 rounded text-xs"
                          >
                            -5
                          </button>
                          <span className="font-heading font-black text-sm text-slate-800 px-2">{p.stock}</span>
                          <button 
                            onClick={() => {
                              const updated = products.map(item => item.id === p.id ? { ...item, stock: item.stock + 5 } : item);
                              setProducts(updated);
                              triggerAlert('Stok ditambahkan 5 unit!');
                            }}
                            className="px-2 py-0.5 font-bold bg-slate-150 hover:bg-slate-200 rounded text-xs"
                          >
                            +5
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[8.5px] text-slate-500 mt-2.5">
                        <span>Margin/Unit: {formatCurrency(totalUnitMargin)}</span>
                        <span>Min Stok Alert: {p.minStock}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. TRANSACTIONS LEDGER RECORD */}
        {activeTab === 'riwayat' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-heading font-bold text-slate-800 text-sm">Buku Kas Dan Jurnal Distribusi</h3>
              <p className="text-[10px] text-slate-500">Pelacak riwayat bon, transfer modal, pengeluaran bensin, dan kwitansi pembeli</p>
            </div>

            <div className="space-y-2.5">
              {transactions.length === 0 ? (
                <div className="bg-white text-center py-10 rounded-3xl border text-xs text-slate-500 font-medium">
                  Belum ada transaksi terekam di database lokal Anda.
                </div>
              ) : (
                transactions.map(tx => {
                  const isSale = tx.type === 'sale';
                  const margins = isSale ? (tx.amount - (tx.cost || 0)) : 0;

                  return (
                    <div key={tx.id} className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-sky-300 transition shadow-xs flex flex-col justify-between gap-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 leading-none ${isSale ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {isSale ? 'Sale' : 'Biaya'}
                            </span>
                            <h4 className="font-heading font-bold text-slate-800 text-xs">
                              {isSale ? tx.customerName : tx.category}
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-normal">{tx.notes || 'Catatan kosong'}</p>
                          <span className="text-[9px] text-slate-500 font-mono font-medium block">{formatDate(tx.timestamp)}</span>
                        </div>

                        <div className="text-right">
                          <p className={`font-heading font-extrabold text-sm ${isSale ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isSale ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          {isSale && (
                            <span className="text-[8.5px] text-slate-500 block font-medium">Profit Margin: <span className="text-slate-800 font-semibold">{formatCurrency(margins)}</span></span>
                          )}
                          <span className="inline-block mt-1.5 text-[8.5px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-605">
                            {tx.paymentMethod || 'Operasional'}
                          </span>
                        </div>
                      </div>

                      {/* Nested items detail review */}
                      {isSale && tx.items && (
                        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-[10px] text-slate-700 space-y-1">
                          {tx.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span>• {it.name} (x{it.quantity})</span>
                              <span className="font-mono text-slate-500">{formatCurrency(it.sellPrice * it.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center border-t border-slate-50 pt-2 text-xs">
                        {isSale ? (
                          <button 
                            onClick={() => setSelectedReceipt(tx)}
                            className="text-blue-600 hover:text-blue-800 font-heading font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Icon name="FileText" size={11} />
                            <span>Cetak Nota Digital</span>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-500 italic">Official operational cost invoice</span>
                        )}

                        <button 
                          onClick={() => handleDeleteTransaction(tx)}
                          className="text-slate-500 hover:text-rose-600 transition text-[11px] flex items-center gap-0.5 font-medium pr-1"
                          title="Cancel transaction fully"
                        >
                          <Icon name="Trash" size={11} />
                          <span>Batalkan</span>
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 5. CUSTOMERS ACCORDION VIEW GROUPED BY REGIONS */}
        {activeTab === 'pelanggan' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-heading font-bold text-slate-800 text-sm">Pusat Data Konsumen Mitra Air</h3>
                <p className="text-[10px] text-slate-500">Data terelasi wilayah kelurahan dan kecamatan, visualisasi volume galon terjual.</p>
              </div>
              <button 
                onClick={() => setShowAddCustomerDrawer(true)}
                className="bg-navy text-white text-[11.5px] font-heading font-semibold px-4.5 py-2.5 rounded-xl self-start sm:self-auto"
              >
                + Tambah Pelanggan
              </button>
            </div>

            {/* Grouped Database Accordion Loop */}
            <div className="space-y-3">
              {Object.keys(customersByKecamatan).length === 0 ? (
                <div className="bg-white py-12 border text-center rounded-3xl text-xs text-slate-500 font-medium">
                  Belum ada data pelanggan yang tersimpan.
                </div>
              ) : (
                Object.keys(customersByKecamatan).map(kecName => (
                  <div key={kecName} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs">
                    
                    {/* Kecamatan Accordion Header Group */}
                    <div className="bg-slate-100/50 px-5 py-3.5 flex justify-between items-center border-b border-slate-100">
                      <span className="font-heading font-extrabold text-xs text-slate-800 tracking-wide uppercase">
                        Kecamatan: {kecName}
                      </span>
                      <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-heading uppercase">
                        {Object.values(customersByKecamatan[kecName]).reduce((total, list) => total + list.length, 0)} Pelanggan
                      </span>
                    </div>

                    {/* Inner List loop organized within Kelurahan */}
                    <div className="p-4 space-y-4">
                      {Object.keys(customersByKecamatan[kecName]).map(kelName => (
                        <div key={kelName} className="space-y-2 border-t border-slate-50 pt-3 first:border-0 first:pt-0">
                          <span className="text-[9.5px] font-bold text-slate-505 tracking-wider uppercase block">
                            • Kelurahan: {kelName}
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {customersByKecamatan[kecName][kelName].map(c => {
                              // Log analytics metrics for the customer
                              const clientSales = transactions.filter(t => t.type === 'sale' && t.customerName === c.name);
                              const totalGallonsBought = clientSales.reduce((acc, t) => {
                                const p1Item = t.items?.find(it => it.productId === 'p1');
                                return acc + (p1Item ? p1Item.quantity : 0);
                              }, 0);

                              return (
                                <div key={c.id} className="bg-slate-50 hover:bg-slate-100/70 p-4 rounded-2xl border border-slate-200/55 transition flex flex-col justify-between min-h-[140px]">
                                  <div>
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-heading font-extrabold text-slate-800 text-sm leading-tight">
                                          {cleanCustomerName(c.name)}
                                        </h4>
                                        <p className="text-[9.5px] text-slate-500 mt-1 flex items-center gap-1 font-mono font-medium">
                                          <Icon name="Phone" size={10} className="text-slate-400" />
                                          <span>{c.phone || 'No Contact'}</span>
                                        </p>
                                      </div>
                                      <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded leading-none shrink-0 ${c.role === 'agen' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                        {c.role || 'konsumen'}
                                      </span>
                                    </div>

                                    <p className="text-[10px] text-slate-500 mt-2.5 leading-relaxed tracking-tight border-t border-slate-200/40 pt-2">
                                      {c.address || 'Alamat tidak dispesifikasikan'}
                                    </p>
                                  </div>

                                  <div className="mt-4 pt-2.5 border-t border-slate-200/50 flex justify-between items-center bg-white/40 -mx-4 -mb-4 p-3 rounded-b-2xl">
                                    <button 
                                      type="button"
                                      onClick={() => setSelectedReportCustomer(c)}
                                      className="text-[10.5px] text-sky-600 hover:underline font-semibold leading-none flex items-center gap-1"
                                    >
                                      <Icon name="FileText" size={11} className="text-sky-500" />
                                      <span>Grafik Laporan ({totalGallonsBought})</span>
                                    </button>

                                    <button 
                                      onClick={() => {
                                        if (window.confirm(`Hapus permanen pelanggan "${c.name}" dari lembar data?`)) {
                                          setCustomers(customers.filter(item => item.id !== c.id));
                                          triggerAlert('Pelanggan berhasil dihapus!');
                                        }
                                      }}
                                      className="text-slate-300 hover:text-rose-600 transition"
                                      title="Hapus profil agen"
                                    >
                                      <Icon name="Trash" size={11} />
                                    </button>
                                  </div>

                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* FLOATING ACTION NAVIGATION CONTROLLER */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-xl z-30 px-4 py-2 flex justify-around max-w-4xl mx-auto rounded-t-2xl">
        
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold font-heading transition-colors ${activeTab === 'dashboard' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Icon name="Sliders" size={15} />
          <span>Dashboard</span>
        </button>

        <button 
          onClick={() => setActiveTab('kasir')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold font-heading transition-colors ${activeTab === 'kasir' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Icon name="Dollar" size={15} />
          <span>Kasir POS</span>
        </button>

        <button 
          onClick={() => setActiveTab('produk')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold font-heading transition-colors ${activeTab === 'produk' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Icon name="Package" size={15} />
          <span>Katalog</span>
        </button>

        <button 
          onClick={() => setActiveTab('riwayat')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold font-heading transition-colors ${activeTab === 'riwayat' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Icon name="History" size={15} />
          <span>Riwayat</span>
        </button>

        <button 
          onClick={() => setActiveTab('pelanggan')}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-bold font-heading transition-colors ${activeTab === 'pelanggan' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Icon name="Users" size={15} />
          <span>Pelanggan</span>
        </button>

      </nav>

      {/* MODAL 1: THERMAL INVOICE / NOTA DIGITAL GENERATOR */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border shadow-2xl relative overflow-y-auto max-h-[90vh]">
            
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <Icon name="X" size={16} />
            </button>

            <div className="text-center font-mono text-[11px] text-slate-700 leading-normal space-y-1 mt-2">
              <h4 className="font-heading font-black text-xs text-slate-800 tracking-wide">CV. TIRTA KEBAIKAN</h4>
              <p className="text-[10px]">Distributor Resmi Air Argus 19 Liter</p>
              <p className="text-[9px] text-slate-500">Kec. Panakkukang & Biringkanaya</p>
              <div className="border-b border-dashed border-slate-300 my-3"></div>

              <div className="text-left space-y-1">
                <div className="flex justify-between">
                  <span>Ref ID:</span>
                  <span>{selectedReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{formatDate(selectedReceipt.timestamp)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Konsumen:</span>
                  <span className="font-bold text-slate-950">{selectedReceipt.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold uppercase text-emerald-700">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 my-3"></div>

              <table className="w-full text-left text-[11px] leading-normal space-y-1.5 align-middle">
                <thead>
                  <tr className="font-bold text-slate-900 border-b border-slate-100">
                    <th className="pb-1">Nama Barang</th>
                    <th className="pb-1 text-center">Qty</th>
                    <th className="pb-1 text-right">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1 saturate-150">{it.name}</td>
                      <td className="py-1 text-center font-bold">x{it.quantity}</td>
                      <td className="py-1 text-right font-bold">{formatCurrency(it.sellPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-b border-dashed border-slate-300 my-3"></div>

              <div className="space-y-1.5 text-right font-bold">
                <div className="flex justify-between font-heading text-xs text-slate-800">
                  <span>TOTAL TAGIHAN:</span>
                  <span>{formatCurrency(selectedReceipt.amount || 0)}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-slate-300 my-3"></div>
              
              <div className="text-center text-[10px] text-slate-500 mt-2">
                <p>Pembayaran Transfer Bank:</p>
                <p className="font-bold text-slate-700 mt-0.5">BCA No.Rek 1528-09-0099</p>
                <p className="text-[9px]">CV. TIRTA KEBAIKAN</p>
                <p className="mt-4 text-emerald-700">Terima kasih atas kerja samanya!</p>
              </div>

            </div>

            {/* Shared POS actions links */}
            <div className="grid grid-cols-2 gap-2 mt-6">
              <button 
                onClick={() => {
                  const itemsText = selectedReceipt.items?.map(it => `- ${it.name} (${it.quantity} unit x ${formatCurrency(it.sellPrice)})`).join('\n') || '';
                  const text = `🔴 *NOTA DIGITAL AIR ARGUS*\n*Distributor: CV. Tirta Kebaikan*\n----------------------------------------\n*Ref ID:* ${selectedReceipt.id}\n*Konsumen:* ${selectedReceipt.customerName}\n*Waktu:* ${formatDate(selectedReceipt.timestamp)}\n*Metode:* ${selectedReceipt.paymentMethod?.toUpperCase()}\n----------------------------------------\n${itemsText}\n----------------------------------------\n*GRAND TOTAL:* *${formatCurrency(selectedReceipt.amount)}*\n\nBCA Rek *1528-09-0099* a/n *CV. TIRTA KEBAIKAN*.\nTerima kasih atas kerja samanya!`;
                  navigator.clipboard.writeText(text);
                  triggerAlert('Isi Nota berhasil disalin ke Clipboard!');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-heading font-semibold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Icon name="Share2" size={12} />
                <span>Share WA Text</span>
              </button>

              <button 
                onClick={() => window.print()}
                className="bg-navy text-white font-heading font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Icon name="Printer" size={12} />
                <span>Slip Print</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: PROGRESS GOALS ADJUSTER */}
      {showTargetModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border shadow-xl relative">
            <button 
              onClick={() => setShowTargetModal(false)}
              className="absolute right-4 top-4 text-slate-400 p-1"
            >
              <Icon name="X" size={16} />
            </button>

            <h4 className="font-heading font-bold text-slate-800 text-sm mb-1">Set Target Capaian Bulanan</h4>
            <p className="text-[10px] text-slate-500 mb-4">Ubah jumlah target sebaran rumah dan toko mitra.</p>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Rumah (KK)</label>
                <input 
                  type="number"
                  value={targetRumah}
                  onChange={e => setTargetRumah(parseInt(e.target.value) || 0)}
                  className="bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Target Toko/Agen Mitra</label>
                <input 
                  type="number"
                  value={targetGalon}
                  onChange={e => setTargetGalon(parseInt(e.target.value) || 0)}
                  className="bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold"
                />
              </div>
            </div>

            <button 
              onClick={() => setShowTargetModal(false)}
              className="w-full bg-navy text-white font-heading font-bold text-xs py-2.5 rounded-xl transition mt-5 shadow-xs"
            >
              Terapkan Konfigurasi Baru
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: INLINE ADD CUSTOMER DRAWER OVERLAY */}
      {showAddCustomerDrawer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border shadow-xl relative">
            <button 
              onClick={() => setShowAddCustomerDrawer(false)}
              className="absolute right-4 top-4 text-slate-400 p-1"
            >
              <Icon name="X" size={16} />
            </button>

            <h4 className="font-heading font-bold text-slate-800 text-sm mb-1">Registrasi Pelanggan Baru</h4>
            <p className="text-[10px] text-slate-500 mb-4">Tambahkan draf alamat agen atau konsumen harian.</p>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
                <input 
                  type="text"
                  placeholder="Pak Joko"
                  value={quickCust.name}
                  onChange={e => setQuickCust({ ...quickCust, name: e.target.value })}
                  className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor HP / Kontak</label>
                <input 
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={quickCust.phone}
                  onChange={e => setQuickCust({ ...quickCust, phone: e.target.value })}
                  className="bg-slate-50 border rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kecamatan</label>
                  <select 
                    value={quickCust.kecamatan}
                    onChange={e => setQuickCust({ ...quickCust, kecamatan: e.target.value })}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Biringkanaya">Biringkanaya</option>
                    <option value="Panakkukang">Panakkukang</option>
                    <option value="Rappocini">Rappocini</option>
                    <option value="Tamalate">Tamalate</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Kelurahan</label>
                  <input 
                    type="text"
                    placeholder="Daya / Pampang"
                    value={quickCust.kelurahan}
                    onChange={e => setQuickCust({ ...quickCust, kelurahan: e.target.value })}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Alamat Pengiriman</label>
                <input 
                  type="text"
                  placeholder="Ruko Sentra Blok BB"
                  value={quickCust.address}
                  onChange={e => setQuickCust({ ...quickCust, address: e.target.value })}
                  className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Peran / Kategori</label>
                <select 
                  value={quickCust.role}
                  onChange={e => setQuickCust({ ...quickCust, role: e.target.value })}
                  className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                >
                  <option value="pelanggan">Konsumen Harian (Rumah)</option>
                  <option value="agen">Agen Distribusi (Depot / Toko)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!quickCust.name) return triggerAlert('Ketik nama lengkap terlebih dahulu!');
                const fresh = {
                  ...quickCust,
                  id: 'c-' + Date.now(),
                  kelurahan: quickCust.kelurahan || 'Lainnya'
                };
                setCustomers([...customers, fresh]);
                setShowAddCustomerDrawer(false);
                setQuickCust({ name: '', phone: '', kecamatan: 'Biringkanaya', kelurahan: '', address: '', role: 'pelanggan' });
                triggerAlert('Data pelanggan baru berhasil diregistrasikan!');
              }}
              className="w-full bg-navy text-white font-heading font-bold text-xs py-2.5 rounded-xl transition mt-5 shadow-xs"
            >
              Simpan Registrasi Pelanggan
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: DEEP CUSTOMER ANALYTICAL REPORT MODAL */}
      {selectedReportCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border shadow-xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setSelectedReportCustomer(null)}
              className="absolute right-4 top-4 text-slate-400 p-1"
            >
              <Icon name="X" size={16} />
            </button>

            <h4 className="font-heading font-black text-slate-800 text-sm">{cleanCustomerName(selectedReportCustomer.name)}</h4>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">{selectedReportCustomer.role} / WILAYAH {selectedReportCustomer.kecamatan}</p>

            {(() => {
              const clientSales = transactions.filter(t => t.type === 'sale' && t.customerName === selectedReportCustomer.name);
              const totalGallons = clientSales.reduce((acc, t) => {
                const p1Item = t.items?.find(it => it.productId === 'p1');
                return acc + (p1Item ? p1Item.quantity : 0);
              }, 0);
              const grossSpent = clientSales.reduce((acc, t) => acc + t.amount, 0);

              return (
                <div className="mt-4 space-y-4 font-sans text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase block font-bold">Total Pembelian</span>
                      <span className="font-heading font-extrabold text-[#111827] text-base">{totalGallons} Galon</span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase block font-bold">Kontribusi Omset</span>
                      <span className="font-heading font-extrabold text-blue-600 text-base">{formatCurrency(grossSpent)}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-slate-500 block mb-2 font-heading">Sensus Log Mutasi Transaksi</span>
                    {clientSales.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">Belum mendeteksi order pembelian air bersih dari akun ini.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {clientSales.map(stx => (
                          <div key={stx.id} className="bg-slate-50 p-2 rounded-lg text-[9.5px] border border-slate-100 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-800">{formatDate(stx.timestamp)}</p>
                              <p className="text-[8.5px] text-slate-400 italic font-mono">{stx.id}</p>
                            </div>
                            <span className="font-bold text-emerald-600 shrink-0">{formatCurrency(stx.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              );
            })()}

            <button 
              onClick={() => setSelectedReportCustomer(null)}
              className="w-full bg-navy text-white font-heading font-bold text-xs py-2.5 rounded-xl transition mt-5 shadow-xs"
            >
              Selesai Evaluasi Laporan
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: SELLING PRODUCT ADD CATALOG CONTROL MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border shadow-xl relative">
            <button 
              onClick={() => setShowProductModal(false)}
              className="absolute right-4 top-4 text-slate-400 p-1"
            >
              <Icon name="X" size={16} />
            </button>

            <h4 className="font-heading font-bold text-slate-800 text-sm mb-1">Mendaftarkan Produk Baru</h4>
            <p className="text-[10px] text-slate-500 mb-4">Tambahkan barang jualan pelengkap distribusi.</p>

            <div className="space-y-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Produk</label>
                <input 
                  type="text"
                  placeholder="Contoh: Galon Mini Refill 5L"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Harga Pokok Modal (Rp)</label>
                  <input 
                    type="number"
                    placeholder="7000"
                    value={newProduct.costPrice}
                    onChange={e => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Harga Jual Konsumen (Rp)</label>
                  <input 
                    type="number"
                    placeholder="10000"
                    value={newProduct.sellPrice}
                    onChange={e => setNewProduct({ ...newProduct, sellPrice: e.target.value })}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Stok Awal Gudang</label>
                  <input 
                    type="number"
                    placeholder="50"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Min Limit Warning</label>
                  <input 
                    type="number"
                    placeholder="15"
                    value={newProduct.minStock}
                    onChange={e => setNewProduct({ ...newProduct, minStock: e.target.value })}
                    className="bg-slate-50 border rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                if (!newProduct.name || !newProduct.costPrice || !newProduct.sellPrice) return triggerAlert('Silakan isi kelengkapan form produk baru!');
                const freshPack: Product = {
                  id: 'p-' + Date.now(),
                  name: newProduct.name,
                  type: newProduct.type,
                  unitName: newProduct.unitName,
                  costPrice: parseInt(newProduct.costPrice) || 0,
                  sellPrice: parseInt(newProduct.sellPrice) || 0,
                  stock: parseInt(newProduct.stock) || 0,
                  minStock: parseInt(newProduct.minStock) || 10,
                };
                setProducts([...products, freshPack]);
                setShowProductModal(false);
                triggerAlert('Data produk jualan baru berhasil didaftarkan!');
              }}
              className="w-full bg-navy text-white font-heading font-bold text-xs py-2.5 rounded-xl transition mt-5 shadow-xs"
            >
              Publikasikan Produk Ke Katalog
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
