import { HousingData } from '../types';

// OpenAI API service for generating AI summaries
export const generateFloodingAnalysis = async (
  apiKey: string,
  floodRisk: { risk: number; level: string },
  housingData: HousingData
): Promise<string> => {
  try {
    const prompt = `
You are an expert in environmental science and real estate analysis. Analyze the following housing data and flooding risk information:

Location: ${housingData.regionName} (${housingData.city}, ${housingData.state})
County: ${housingData.countyName}
Metro Area: ${housingData.metro}
Current Flooding Risk: ${floodRisk.level} (${floodRisk.risk}%)

Based on this information:
1. Explain the likely factors contributing to this flooding risk percentage
2. Describe how this risk level might impact property values in this area
3. Highlight actionable insights for homeowners or potential buyers
4. Mention other environmental factors that might be relevant (e.g., proximity to water bodies, elevation, climate change projections)
5. Suggest 2-3 specific mitigation strategies appropriate for this risk level

Keep your response concise, informative, and actionable.

DO NOT include the character "*" or any numbered lists in your response.

You should follow this format for your response, which is an example using Folsom, CA:

Location: Folsom, CA (Sacramento County)
Metro Area: Sacramento-Roseville-Arden-Arcade, CA
Current Flooding Risk: High (92%)

Analysis:

Folsom is situated downstream of Folsom Dam on the American River. Areas along the river are naturally prone to flooding. While Folsom Dam provides significant flood control, exceptionally heavy rainfall events in the Sierra Nevada watershed feeding the American River, or operational issues with the dam itself, could lead to high water levels.
A large amount of impervious surfaces, such as roads, buildings, parking lots, are present in Folsom in developed areas. These increase surface runoff during heavy rains, potentially overwhelming drainage systems.
A large proportion of properties within this geographical boundary fall within FEMA-designated Special Flood Hazard Areas (SFHAs), corresponding to the high annual chance of flooding.
Impact on Property Values:

Properties within SFHAs typically require mandatory flood insurance for federally backed mortgages, adding a significant annual expense for homeowners. High risk translates to higher premiums. Insurance costs are likely to be high in Folsom.
High flood risk can deter potential buyers, potentially leading to longer times on the market or downward pressure on property values compared to similar properties in lower-risk zones.
Sellers are typically required to disclose known flood risks, which can influence negotiations and final sale prices.

Actionable Insights for Homeowners/Buyers:

Consider obtaining the official FEMA Flood Insurance Rate Map (FIRM) for the specific property to confirm its flood zone designation and Base Flood Elevation (BFE), if applicable.
Get quotes for flood insurance early in the buying process or review existing coverage annually. Understand your coverage limits and deductibles. Consider policies from the National Flood Insurance Program (NFIP) and private insurers.
You can also investigate historical data by researching past flooding events in the immediate area.

Other Relevant Environmental Factors:

Folsom Dam: The integrity and operational capacity of the dam is a major factor in flood risk.
Elevation: Specific property elevation relative to the river and BFE is critical. Even within a high-risk zone, higher-elevation properties face less risk.
Climate Change: Projections for California suggest potential increases in the intensity of atmospheric rivers and extreme precipitation events, which could exacerbate future flood risks. Conversely, drought periods affect reservoir levels.
Upstream Conditions: Snowpack levels in the Sierra Nevada significantly influence runoff into the American River watershed.

Overall, the high flooding risk level in Folsom is a significant factor in the housing market.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert environmental analyst specializing in flooding risk assessment and real estate impacts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`Failed to generate analysis: ${error.message}`);
  }
};