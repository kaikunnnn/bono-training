import type { WebflowVideo, WebflowSeries, WebflowCollectionResponse } from './types.ts';

const WEBFLOW_API_BASE = 'https://api.webflow.com/v2';
const VIDEOS_COLLECTION_ID = '6029d027f6cb8852cbce8c75';
const SERIES_COLLECTION_ID = '6029d01e01a7fb81007f8e4e';

export class WebflowClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetchWebflow<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webflow API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get a Series by ID
   */
  async getSeries(seriesId: string): Promise<WebflowSeries> {
    const url = `${WEBFLOW_API_BASE}/collections/${SERIES_COLLECTION_ID}/items/${seriesId}`;
    return this.fetchWebflow<WebflowSeries>(url);
  }

  /**
   * Get a Series by slug
   */
  async getSeriesBySlug(slug: string): Promise<WebflowSeries | null> {
    const url = `${WEBFLOW_API_BASE}/collections/${SERIES_COLLECTION_ID}/items`;
    const response = await this.fetchWebflow<WebflowCollectionResponse<WebflowSeries>>(url);
    
    const series = response.items.find(item => {
      const itemSlug = item.fieldData?.slug || item.slug;
      return itemSlug === slug;
    });
    
    return series || null;
  }

  /**
   * Get all Videos for a Series, ordered by series-video-order
   */
  async getVideosForSeries(seriesId: string): Promise<WebflowVideo[]> {
    const url = `${WEBFLOW_API_BASE}/collections/${VIDEOS_COLLECTION_ID}/items?limit=100`;
    const response = await this.fetchWebflow<WebflowCollectionResponse<WebflowVideo>>(url);
    
    const seriesVideos = response.items.filter(video => {
      const videoSeriesId = video.fieldData?.series || video.series;
      return videoSeriesId === seriesId;
    });
    
    seriesVideos.sort((a, b) => {
      const orderA = a['series-video-order'] || a.fieldData?.['series-video-order'] || 0;
      const orderB = b['series-video-order'] || b.fieldData?.['series-video-order'] || 0;
      return orderA - orderB;
    });
    
    return seriesVideos;
  }

  /**
   * Resolve Series ID from either ID or slug
   */
  async resolveSeriesId(idOrSlug: string): Promise<{ id: string; series: WebflowSeries } | null> {
    try {
      const series = await this.getSeries(idOrSlug);
      return { id: idOrSlug, series };
    } catch (error) {
      console.log(`Failed to get series by ID, trying slug: ${idOrSlug}`);
    }
    
    const series = await this.getSeriesBySlug(idOrSlug);
    if (series) {
      return { id: series.id, series };
    }
    
    return null;
  }
}
