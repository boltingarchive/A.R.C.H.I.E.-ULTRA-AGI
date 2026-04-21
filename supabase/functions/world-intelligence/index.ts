import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NewsItem {
  title: string;
  description: string;
  source: string;
  url: string;
  pubDate: string;
}

async function fetchRecentNews(): Promise<NewsItem[]> {
  try {
    const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";
    const feeds = [
      "https://feeds.bbci.co.uk/news/world/rss.xml",
      "https://feeds.theguardian.com/theguardian/world/rss",
    ];

    const results = await Promise.allSettled(
      feeds.map((url) =>
        fetch(`${RSS2JSON}${encodeURIComponent(url)}&count=5&api_key=free`)
          .then((r) => r.json())
          .then((data) =>
            data.items
              ? data.items.map((item: Record<string, unknown>) => ({
                  title: item.title || "Untitled",
                  description: String(item.description || "").replace(
                    /<[^>]+>/g,
                    ""
                  ),
                  source: data.feed?.title || "News Feed",
                  url: item.link || item.url || "#",
                  pubDate: item.pubDate || new Date().toISOString(),
                }))
              : []
          )
      )
    );

    const allNews = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => (r as PromiseFulfilledResult<NewsItem[]>).value)
      .slice(0, 10);

    return allNews;
  } catch (error) {
    console.error("News fetch error:", error);
    return [];
  }
}

function generateAnalysis(query: string, newsItems: NewsItem[]): string {
  const lowerQuery = query.toLowerCase();
  const words = lowerQuery.split(" ").filter((w) => w.length > 3);

  // Extract context from news - improved matching
  const relevantNews = newsItems.filter((item) => {
    const text =
      (item.title + " " + item.description).toLowerCase();
    return words.some((w) => text.includes(w)) || text.includes(lowerQuery);
  }).sort((a, b) => {
    // Prioritize by relevance
    const aMatch = (a.title + " " + a.description).toLowerCase();
    const bMatch = (b.title + " " + b.description).toLowerCase();
    const aScore = words.filter((w) => aMatch.includes(w)).length;
    const bScore = words.filter((w) => bMatch.includes(w)).length;
    return bScore - aScore;
  });

  // Build professional analysis based on context
  let analysis = "";
  const hasRelevantNews = relevantNews.length > 0;

  // Categorize query type and generate contextual response
  if (
    lowerQuery.includes("trend") ||
    lowerQuery.includes("what") ||
    lowerQuery.includes("latest") ||
    lowerQuery.includes("happening")
  ) {
    analysis = "Current Global Trends Assessment: ";
    if (hasRelevantNews) {
      const topNews = relevantNews.slice(0, 2);
      analysis += topNews.map((n) => n.title).join(". ") + ". ";
      analysis +=
        "These developments reflect broader patterns in international relations and geopolitical realignment. ";
    } else {
      analysis +=
        "Global intelligence monitoring indicates several concurrent developments across key regions. ";
    }
    analysis +=
      "Primary areas of focus include European security dynamics, Indo-Pacific regional tensions, Middle East developments, and transatlantic policy coordination. ";
    analysis +=
      "Secondary factors include economic integration challenges and multilateral institutional effectiveness. ";
    analysis +=
      "Professional recommendation: Maintain continuous monitoring of official government statements and established international media sources.";
  } else if (
    lowerQuery.includes("analysis") ||
    lowerQuery.includes("impact") ||
    lowerQuery.includes("situation")
  ) {
    if (hasRelevantNews) {
      const mainNews = relevantNews[0];
      analysis = `Situational Analysis - ${mainNews.title}: `;
      analysis +=
        "This development carries significant implications for regional stability, economic activity, and diplomatic relations. ";
      analysis +=
        "Affected stakeholders include national governments, international organizations, multinational corporations, and civilian populations. ";
      analysis +=
        "Short-term implications may include policy adjustments and diplomatic activity. ";
      analysis +=
        "Long-term consequences could reshape regional power dynamics and economic relationships. ";
      analysis += `Information source: ${mainNews.source}. `;
    } else {
      analysis =
        "Comprehensive Analysis: Current geopolitical landscape demonstrates complex interdependencies across multiple domains - security, economics, and diplomacy. ";
    }
    analysis +=
      "Professional assessment: Recommend detailed analysis across authoritative international news networks and official institutional statements for complete situational awareness.";
  } else if (
    lowerQuery.includes("crisis") ||
    lowerQuery.includes("emergency") ||
    lowerQuery.includes("conflict")
  ) {
    const urgentNews = newsItems.filter(
      (item) =>
        item.title.toLowerCase().includes("crisis") ||
        item.title.toLowerCase().includes("emergency") ||
        item.title.toLowerCase().includes("conflict")
    );

    if (urgentNews.length > 0) {
      analysis = `Critical Situation Assessment: ${urgentNews[0].title}. `;
      analysis +=
        "Immediate response mechanisms are reportedly activated at governmental and international organizational levels. ";
      analysis +=
        "Humanitarian assistance protocols and diplomatic channels are engaged. ";
      analysis +=
        "Regional and international stakeholders are coordinating response and mitigation strategies. ";
      analysis += `Current reporting: ${urgentNews[0].source}. `;
    } else {
      analysis =
        "Global Crisis Monitoring: Existing monitoring frameworks track multiple potential crisis points globally. ";
    }
    analysis +=
      "International organizations and national governments maintain active crisis management coordination. ";
    analysis +=
      "Professional focus: Humanitarian outcomes and de-escalation pathways remain primary objectives.";
  } else if (
    lowerQuery.includes("economy") ||
    lowerQuery.includes("market") ||
    lowerQuery.includes("trade")
  ) {
    analysis = "Economic Intelligence Assessment: ";
    analysis +=
      "Global markets exhibit interconnected dynamics with regional variations. Key indicators include exchange rates, commodity prices, equity markets, and bond yields. ";
    if (hasRelevantNews) {
      analysis += `Current developments: ${relevantNews[0].title}. `;
    }
    analysis +=
      "Central banks and financial regulators are implementing policies addressing inflation, growth, and financial stability. ";
    analysis +=
      "Trade relationships continue evolving with ongoing negotiations and policy adjustments. ";
    analysis +=
      "Professional analysis: Monitor central bank communications, quarterly GDP releases, employment data, and international trade statistics for comprehensive market assessment.";
  } else if (
    lowerQuery.includes("technology") ||
    lowerQuery.includes("tech") ||
    lowerQuery.includes("artificial intelligence")
  ) {
    analysis =
      "Technology Intelligence Assessment: Global technological advancement accelerates across multiple domains including artificial intelligence, quantum computing, cybersecurity, and space capabilities. ";
    analysis +=
      "Strategic implications include competitive advantage in emerging technologies, national security considerations, and economic growth drivers. ";
    if (hasRelevantNews) {
      analysis += `Recent developments: ${relevantNews[0].title}. `;
    }
    analysis +=
      "Major powers are increasing investment in critical technology sectors. Regulatory frameworks are evolving to address security and ethical considerations. ";
    analysis +=
      "Professional assessment: Technological capabilities increasingly determine geopolitical positioning and economic competitiveness.";
  } else if (
    lowerQuery.includes("security") ||
    lowerQuery.includes("defense")
  ) {
    analysis =
      "Security Intelligence Assessment: Global security environment reflects evolving threat matrices including conventional military capabilities, cyber operations, and strategic competition. ";
    if (hasRelevantNews) {
      analysis += `Key developments: ${relevantNews[0].title}. `;
    }
    analysis +=
      "Military modernization programs continue across major powers. Alliances and partnership agreements are being reassessed. ";
    analysis +=
      "Emerging security challenges include climate-related risks, pandemics, and resource competition. ";
    analysis +=
      "Professional analysis: Recommend monitoring military announcements, defense agreements, and security organization assessments.";
  } else {
    // Comprehensive default analysis
    analysis = "Global Intelligence Brief: ";
    if (hasRelevantNews) {
      analysis += relevantNews.slice(0, 2).map((n) => n.title).join(". ") + ". ";
    }
    analysis +=
      "Current international situation demonstrates complex interactions across geopolitical, economic, and social dimensions. ";
    analysis +=
      "Key monitoring domains include great power relations, regional stability, economic integration, technological advancement, and humanitarian conditions. ";
    analysis +=
      "Institutional actors including governments, international organizations, and civil society remain engaged in addressing multifaceted challenges. ";
    analysis +=
      "A.R.C.H.I.E. Intelligence Recommendation: Comprehensive situational awareness requires continuous monitoring of authoritative international news sources, official government communications, and specialized intelligence networks.";
  }

  return analysis;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameter",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch recent news
    const newsItems = await fetchRecentNews();

    // Generate professional analysis
    const analysis = generateAnalysis(query, newsItems);

    // Return response with source information
    return new Response(
      JSON.stringify({
        response: analysis,
        sources: newsItems.slice(0, 3).map((n) => ({
          title: n.title,
          source: n.source,
          url: n.url,
        })),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process intelligence request",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
