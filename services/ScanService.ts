export class ScanService {
  async scanReceipt(file: File, categories: string[]): Promise<any> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API Key is not configured on the server.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString("base64");

    const prompt = `Analyze the uploaded receipt/invoice image or PDF.
Extract the following information:
1. The date of the receipt (format: "YYYY-MM-DD").
2. The name of the vendor/merchant.
3. The individual line items.

For each line item, extract:
- description: name/description of the item.
- qty: quantity (default to 1 if not specified).
- amount: unit price of the item (as a number).
- category: match the item's description to one of the following valid categories: ${JSON.stringify(categories)}. Choose the most appropriate one. If none match, choose the closest or return an empty string.

Return the result as a JSON object with this exact shape:
{
  "date": "YYYY-MM-DD",
  "vendor": "Vendor Name",
  "totalAmount": 123.45,
  "items": [
    {
      "description": "Item description",
      "qty": 1,
      "amount": 9.99,
      "category": "Matched Category Name"
    }
  ]
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      throw new Error(`Gemini API failed: ${response.statusText}`);
    }

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error("Could not extract text from Gemini response");
    }

    return JSON.parse(candidateText);
  }
}
