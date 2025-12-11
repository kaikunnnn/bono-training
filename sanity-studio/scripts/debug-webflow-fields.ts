/**
 * Debug script: Webflow Series のフィールド名を確認
 */

const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN || '674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76';
const SERIES_COLLECTION_ID = '6029d01e01a7fb81007f8e4e';

async function debugWebflowFields(seriesId: string) {
  const response = await fetch(
    `https://api.webflow.com/v2/collections/${SERIES_COLLECTION_ID}/items/${seriesId}`,
    {
      headers: {
        'Authorization': `Bearer ${WEBFLOW_TOKEN}`,
        'accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Webflow API error: ${response.status}`);
  }

  const series = await response.json();

  console.log('\n=== Webflow Series Data ===\n');
  console.log('Series ID:', series.id);
  console.log('Series Name:', series.fieldData?.name || series.name);
  console.log('\n=== All fieldData keys ===\n');
  
  if (series.fieldData) {
    Object.keys(series.fieldData).forEach(key => {
      const value = series.fieldData[key];
      const type = typeof value;
      const preview = type === 'string' 
        ? (value.length > 100 ? value.substring(0, 100) + '...' : value)
        : JSON.stringify(value).substring(0, 100);
      
      console.log(`- ${key}: (${type}) ${preview}`);
    });
  }

  console.log('\n=== Checking ExplainWhyThisSeries-Description ===\n');
  const desc1 = series.fieldData?.['ExplainWhyThisSeries-Description'];
  const desc2 = series.fieldData?.['explainwhythisseries-description'];
  const desc3 = series.fieldData?.['ExplainWhyThisSeriesDescription'];
  
  console.log('ExplainWhyThisSeries-Description:', desc1 ? 'EXISTS ✅' : 'NOT FOUND ❌');
  console.log('explainwhythisseries-description:', desc2 ? 'EXISTS ✅' : 'NOT FOUND ❌');
  console.log('ExplainWhyThisSeriesDescription:', desc3 ? 'EXISTS ✅' : 'NOT FOUND ❌');
  
  if (desc1) {
    console.log('\nValue preview:', desc1.substring(0, 200));
  }
}

const seriesId = '684a8fd0ff2a7184d2108210';
debugWebflowFields(seriesId).catch(console.error);
