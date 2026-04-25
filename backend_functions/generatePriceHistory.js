import { base44 } from '@/api/base44Client';

/**
 * Genera storico prezzi realistico per tutte le sneaker basato su variazioni percentuali
 */
export async function generatePriceHistory() {
  const sneakers = await base44.entities.Sneaker.list('-created_date', 300);

  for (const sneaker of sneakers) {
    if (!sneaker.current_price) continue;

    // Genera storico di 30 giorni con variazioni realistiche
    const priceHistory = [];
    let currentPrice = sneaker.current_price;
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Interpola la variazione per questo giorno
      const volatility = sneaker.volatility === 'high' ? 0.05 : sneaker.volatility === 'medium' ? 0.02 : 0.01;
      const dailyChange = (Math.random() - 0.5) * volatility * currentPrice;
      
      currentPrice = Math.max(sneaker.current_price * 0.7, currentPrice + dailyChange);

      priceHistory.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(currentPrice * 100) / 100,
      });
    }

    // Aggiorna il database
    await base44.entities.Sneaker.update(sneaker.id, {
      price_history: priceHistory,
    });
  }

  return { success: true, message: 'Price history generated for all sneakers' };
}