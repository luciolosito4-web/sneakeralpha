import { base44 } from '@/api/base44Client';

/**
 * Genera storico prezzi realistico per una singola sneaker
 * basato su variazioni percentuali esistenti
 */
export function generateRealisticPriceHistory(sneaker) {
  if (!sneaker.current_price) return [];

  const priceHistory = [];
  let price = sneaker.current_price;
  const today = new Date();

  // Usa la volatilità per determinare la variabilità giornaliera
  const volatilityFactor = {
    low: 0.005,
    medium: 0.015,
    high: 0.035,
  }[sneaker.volatility] || 0.01;

  // Genera 30 giorni di storia
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Trend generale basato su price_change_30d
    const trendFactor = (sneaker.price_change_30d || 0) / 100 / 30;
    
    // Variazione casuale
    const randomVariation = (Math.random() - 0.5) * volatilityFactor * price;
    
    // Applica trend + variazione
    price = Math.max(sneaker.current_price * 0.7, price * (1 + trendFactor) + randomVariation);

    priceHistory.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    });
  }

  return priceHistory;
}

/**
 * Aggiorna tutte le sneaker con storico prezzi realistico
 */
export async function populateAllPriceHistories() {
  try {
    const sneakers = await base44.entities.Sneaker.list('-created_date', 300);
    
    for (const sneaker of sneakers) {
      const priceHistory = generateRealisticPriceHistory(sneaker);
      await base44.entities.Sneaker.update(sneaker.id, { price_history: priceHistory });
    }

    return { success: true, count: sneakers.length };
  } catch (error) {
    console.error('Error populating price histories:', error);
    throw error;
  }
}