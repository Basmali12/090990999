export type InventoryWallet={id:string;name:string;balance:number};
export function readInventoryWallets():InventoryWallet[]{
 try{const rows:unknown=JSON.parse(localStorage.getItem('dashboard-wallets-v1')||'null');if(Array.isArray(rows)&&rows.every(r=>r&&typeof r.id==='string'&&typeof r.name==='string'&&typeof r.balance==='number'&&Number.isFinite(r.balance)&&r.balance>=0))return rows;}catch{/* Local mock fallback. */}
 return [{id:'zain',name:'Zain Cash',balance:2450000},{id:'qi',name:'SuperQi',balance:3800000}];
}
