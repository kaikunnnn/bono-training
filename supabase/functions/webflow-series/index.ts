import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { WebflowClient } from "./webflow-client.ts";
import { transformToLesson } from "./transformer.ts";
import { getCached, setCache } from "./cache.ts";
import type { WebflowSeriesResponse } from "./types.ts";

function logDebug(message: string, data?: any) {
  console.log(`[WEBFLOW-SERIES] ${message}`, data ? JSON.stringify(data) : '');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logDebug("Function started");

    const webflowToken = Deno.env.get("WEBFLOW_API_TOKEN");
    if (!webflowToken) {
      throw new Error("WEBFLOW_API_TOKEN environment variable not set");
    }

    // POSTリクエストのボディからSeriesIDを取得
    const body = await req.json();
    const seriesIdOrSlug = body.seriesId || body.id || body.slug;

    if (!seriesIdOrSlug) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing 'seriesId', 'id', or 'slug' in request body",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    logDebug("Fetching series", { seriesIdOrSlug });

    const client = new WebflowClient(webflowToken);

    const resolved = await client.resolveSeriesId(seriesIdOrSlug);
    
    if (!resolved) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Series not found: ${seriesIdOrSlug}`,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { id: seriesId, series } = resolved;
    logDebug("Series resolved", { seriesId, seriesName: series.name });

    const cached = getCached(seriesId);
    if (cached) {
      logDebug("Cache hit", { seriesId });
      const response: WebflowSeriesResponse = {
        lesson: cached,
        success: true,
        cached: true,
        timestamp: new Date().toISOString(),
      };
      
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logDebug("Cache miss, fetching from Webflow", { seriesId });

    const videos = await client.getVideosForSeries(seriesId);
    logDebug("Videos fetched", { count: videos.length });

    const lesson = transformToLesson(series, videos);
    logDebug("Transformation complete", { 
      questCount: lesson.quests.length,
      totalArticles: lesson.quests.reduce((sum, q) => sum + q.articles.length, 0)
    });

    setCache(seriesId, lesson);

    const response: WebflowSeriesResponse = {
      lesson: lesson,
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in webflow-series function:", error);
    logDebug("Error occurred", { error: error.message });

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
