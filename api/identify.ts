import type { VercelRequest, VercelResponse } from '@vercel/node';
import { findCareProfile, guessCategoryFromTaxonomy } from '../src/lib/careProfiles.js';

interface PlantIdSuggestion {
  name: string;
  probability: number;
  details?: {
    common_names?: string[];
    taxonomy?: Record<string, string>;
  };
}

interface PlantIdResponse {
  result?: {
    classification?: {
      suggestions?: PlantIdSuggestion[];
    };
    is_plant?: {
      probability?: number;
    };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { image } = req.body ?? {};
  if (!image || typeof image !== 'string') {
    res.status(400).json({ error: 'Missing "image" (base64 data URL) in request body' });
    return;
  }

  // Plant.id expects the raw base64 payload, not a full "data:image/jpeg;base64,..." data URL.
  const mimePrefix = image.includes(',') ? image.slice(0, image.indexOf(',')) : '(no data URL prefix)';
  const base64Image = image.includes(',') ? image.split(',')[1] : image;
  console.log(
    `identify request: mime="${mimePrefix}" base64Length=${base64Image.length} base64Prefix="${base64Image.slice(0, 16)}"`
  );

  const apiKey = process.env.PLANT_ID_API_KEY;
  if (!apiKey) {
    const draft = findCareProfile('', '', 0, null);
    res.status(200).json({
      draft,
      suggestions: [],
      warning:
        'PLANT_ID_API_KEY is not configured on the server, so species could not be identified automatically. Fill in the card manually below.',
    });
    return;
  }

  try {
    const plantIdRes = await fetch(
      'https://api.plant.id/v3/identification?details=common_names,taxonomy,description,watering,url',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': apiKey,
        },
        body: JSON.stringify({
          images: [base64Image],
          similar_images: false,
        }),
      }
    );

    if (!plantIdRes.ok) {
      const text = await plantIdRes.text();
      console.error(`Plant.id identification error ${plantIdRes.status}:`, text.slice(0, 2000));
      const draft = findCareProfile('', '', 0, null);
      res.status(200).json({
        draft,
        suggestions: [],
        warning: `Identification service returned an error (${plantIdRes.status}). Fill in the card manually below.`,
        detail: text.slice(0, 500),
      });
      return;
    }

    const data = (await plantIdRes.json()) as PlantIdResponse;
    const suggestions = data.result?.classification?.suggestions ?? [];

    if (suggestions.length === 0) {
      const draft = findCareProfile('', '', 0, null);
      res.status(200).json({
        draft,
        suggestions: [],
        warning: 'No species match found. Fill in the card manually below.',
      });
      return;
    }

    const top = suggestions[0];
    const commonName = top.details?.common_names?.[0] ?? top.name;
    const scientificName = top.name;
    const taxonomyText = JSON.stringify(top.details?.taxonomy ?? {});
    const categoryHint = guessCategoryFromTaxonomy(taxonomyText);

    const draft = findCareProfile(commonName, scientificName, top.probability, categoryHint);

    res.status(200).json({
      draft,
      suggestions: suggestions.slice(0, 3).map((s) => ({
        common_name: s.details?.common_names?.[0] ?? s.name,
        scientific_name: s.name,
        probability: s.probability,
      })),
    });
  } catch (err) {
    console.error('Plant.id identification request failed:', err);
    const draft = findCareProfile('', '', 0, null);
    res.status(200).json({
      draft,
      suggestions: [],
      warning: 'Identification request failed. Fill in the card manually below.',
      detail: err instanceof Error ? err.message : String(err),
    });
  }
}
