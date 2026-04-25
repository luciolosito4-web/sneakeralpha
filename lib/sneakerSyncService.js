import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export async function syncSneakerPrices(sneakers) {
  if (!sneakers || sneakers.length === 0) return;

  try {
    // Sincronizza un batch di sneaker (max 5 per volta per evitare rate limit)
    const batch = sneakers.slice(0, 5);
    const sneakerNames = batch.map(s => `${s.brand} ${s.name}`).join(', ');

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Cerca i prezzi attuali di queste sneaker su siti di resale come StockX, Grailed, SNKRS, eBay:
${batch.map(s => `- ${s.brand} ${s.name}${s.colorway ? ` (${s.colorway})` : ''}`).join('\n')}

Restituisci i dati in JSON con questa struttura esatta:
{
  "sneakers": [
    {"name": "Nike...", "brand": "Nike", "current_price": 250, "change_24h": 2.5, "volume_30d": 120}
  ]
}

Se non trovi il prezzo, ometti l'elemento. Restituisci SOLO il JSON valido, niente altro.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          sneakers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                brand: { type: 'string' },
                current_price: { type: 'number' },
                change_24h: { type: 'number' },
                volume_30d: { type: 'number' }
              }
            }
          }
        }
      },
      model: 'gemini_3_flash'
    });

    // Aggiorna i dati nel database
    const updates = [];
    if (response?.sneakers) {
      for (const data of response.sneakers) {
        const matching = batch.find(s => 
          s.brand?.toLowerCase() === data.brand?.toLowerCase() && 
          s.name?.toLowerCase().includes(data.name?.toLowerCase())
        );
        if (matching) {
          updates.push(
            base44.entities.Sneaker.update(matching.id, {
              current_price: data.current_price,
              price_change_24h: data.change_24h,
              volume_30d: data.volume_30d,
            })
          );
        }
      }
    }

    await Promise.all(updates);
    return { success: true, updated: updates.length };
  } catch (error) {
    console.error('Sync error:', error);
    throw error;
  }
}