/**
 * Debug script: Webflow Videos のフィールド名を確認
 */

const WEBFLOW_TOKEN = process.env.WEBFLOW_TOKEN || '674b54cf2429858c005eb647787f444c749bb324a1ca1615b6cf4967b4033e76';
const VIDEOS_COLLECTION_ID = '6029d027f6cb8852cbce8c75';

async function debugWebflowVideoFields(seriesId: string) {
  const response = await fetch(
    `https://api.webflow.com/v2/collections/${VIDEOS_COLLECTION_ID}/items?cmsLocaleId=653ad49de882f528502ba794`,
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

  const data = await response.json();
  const videos = data.items.filter((v: any) => {
    const videoSeriesId = v.fieldData?.series || v.series;
    return videoSeriesId === seriesId;
  });

  console.log(`\n=== Found ${videos.length} videos for series ${seriesId} ===\n`);

  if (videos.length > 0) {
    const firstVideo = videos[0];
    console.log('First Video ID:', firstVideo.id);
    console.log('First Video Title:', firstVideo.fieldData?.VideoTitle || firstVideo.fieldData?.name);

    console.log('\n=== All fieldData keys (first video) ===\n');

    if (firstVideo.fieldData) {
      Object.keys(firstVideo.fieldData).forEach(key => {
        const value = firstVideo.fieldData[key];
        const type = typeof value;
        let preview = '';
        if (type === 'string') {
          preview = value.length > 80 ? value.substring(0, 80) + '...' : value;
        } else {
          const jsonStr = JSON.stringify(value);
          preview = jsonStr.substring(0, 80);
        }

        console.log(`- ${key}: (${type}) ${preview}`);
      });
    }

    console.log('\n=== Checking thumbnail fields ===\n');
    const thumb1 = firstVideo.fieldData?.['video-thumbnail'];
    const thumb2 = firstVideo.fieldData?.['videothumbnail'];
    const thumb3 = firstVideo.fieldData?.['thumbnail'];

    console.log('video-thumbnail:', thumb1 ? `EXISTS ✅` : 'NOT FOUND ❌');
    if (thumb1) console.log('  ', JSON.stringify(thumb1));

    console.log('videothumbnail:', thumb2 ? `EXISTS ✅` : 'NOT FOUND ❌');
    if (thumb2) console.log('  ', JSON.stringify(thumb2));

    console.log('thumbnail:', thumb3 ? `EXISTS ✅` : 'NOT FOUND ❌');
    if (thumb3) console.log('  ', JSON.stringify(thumb3));

    console.log('\n=== Checking video URL fields ===\n');
    const url1 = firstVideo.fieldData?.['link-video-3'];
    const url2 = firstVideo.fieldData?.['freevideourl'];

    console.log('link-video-3:', url1 ? `EXISTS ✅ - ${url1}` : 'NOT FOUND ❌');
    console.log('freevideourl:', url2 ? `EXISTS ✅ - ${url2}` : 'NOT FOUND ❌');
  }
}

const seriesId = '684a8fd0ff2a7184d2108210';
debugWebflowVideoFields(seriesId).catch(console.error);
