export const registers=[{id:'main',name:'الصندوق الرئيسي',branch:'الصندوق الرئيسي'}];
export const boxName=(id:string)=>registers.find(b=>b.id===id)?.name||id;
