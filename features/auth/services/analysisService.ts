import { listFinishedDrinkingRecords } from "./recordService";

export async function getAnalysisData() {
  const recordData = await listFinishedDrinkingRecords();

  const totals = recordData.reduce((acc, record)=>({
    grams:acc.grams + (record.weight_grams ?? 0),
    yen:acc.yen + (record.price_yen ?? 0)}),{grams:0, yen:0}
  );

  const count = recordData.length;

  const frequency = recordData.reduce<Map<string, number>>((acc, record) => {
  const id = record.coffee_id;
  if (!id) return acc; // ID が無いなら無視
  acc.set(id, (acc.get(id) ?? 0) + 1);
  return acc;
}, new Map());

  const coffeeRanking = Array.from(frequency.entries())
  .map(([coffeeId, count]) => ({ coffeeId, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 3);

  const RankingWithName = coffeeRanking.map(item => {
    const record = recordData.find(r => r.coffee_id === item.coffeeId);
    return {
      ...item,
      name: record?.coffee?.name || "Unknown",
      brand: record?.coffee?.brand?.name || "Unknown"
    };
  });

  const currentYear = new Date().getFullYear();
  const base = new Date();
  const monthKeys: string[] = [];
  const monthLabels: string[] = [];

  for (let offset = 0; offset < 6; offset++) {
    const d = new Date(base);
    d.setMonth(base.getMonth() - offset);
    const label = `${d.getMonth() + 1}月`;
    monthLabels.unshift(label);
    monthKeys.unshift(`${currentYear}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  const buckets = new Map<string, { grams: number; yen: number }>(
  monthKeys.map((key) => [key, { grams: 0, yen: 0 }])
  );

  recordData.reduce((acc, record) => {
  const purchaseDate = record.purchase_date ?? record.start_date;
  if (purchaseDate) {
    const purchaseKey = purchaseDate.slice(0, 7);
    const bucket = acc.get(purchaseKey);
    if (bucket) {
      bucket.yen += record.price_yen ?? 0;
    }
  }

  // 消費量は end_date がある月のみ集計
  const consumptionDate = record.end_date;
  if (consumptionDate) {
    const consumptionKey = consumptionDate.slice(0, 7);
    const bucket = acc.get(consumptionKey);
    if (bucket) {
      bucket.grams += record.weight_grams ?? 0;
    }
  }

  return acc;
}, buckets);

  const monthlyData = Array.from(buckets.values());

  return {
    totals,
    count,
    coffeeRanking: RankingWithName,
    monthlyData,
    monthLabels
  };

};
