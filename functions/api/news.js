const HN_API = "https://hacker-news.firebaseio.com/v0";
const FETCH_LIMIT = 60;

const FEED_MAP = {
  top:  "topstories",
  new:  "newstories",
  best: "beststories",
  ask:  "askstories",
  show: "showstories",
};

async function fetchItem(id, signal) {
  const res = await fetch(`${HN_API}/item/${id}.json`, { signal });
  if (!res.ok) throw new Error(`Item ${id} failed: ${res.status}`);
  return res.json();
}

function normalizeStory(item) {
  return {
    id:           item.id,
    title:        item.title ?? "Untitled",
    url:          item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
    score:        item.score ?? 0,
    author:       item.by ?? "unknown",
    commentCount: item.descendants ?? 0,
    timestamp:    item.time ? item.time * 1000 : Date.now(),
    type:         item.type ?? "story",
    hnUrl:        `https://news.ycombinator.com/item?id=${item.id}`,
  };
}

export async function onRequest({ request }) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  const url = new URL(request.url);
  const feed = url.searchParams.get("feed") ?? "top";
  const endpoint = FEED_MAP[feed] ?? FEED_MAP.top;

  const cf = request.cf ?? {};
  const edgeMeta = {
    colo:            cf.colo ?? "DEV",
    country:         cf.country ?? "XX",
    city:            cf.city ?? "Local",
    region:          cf.region ?? "",
    asOrganization:  cf.asOrganization ?? "Cloudflare Dev",
    tlsVersion:      cf.tlsVersion ?? "TLSv1.3",
    httpProtocol:    cf.httpProtocol ?? "HTTP/2",
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const idsRes = await fetch(`${HN_API}/${endpoint}.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!idsRes.ok) throw new Error(`Feed fetch failed: ${idsRes.status}`);

    const allIds = await idsRes.json();
    const ids = allIds.slice(0, FETCH_LIMIT);

    const itemController = new AbortController();
    const itemTimeout = setTimeout(() => itemController.abort(), 4000);

    const settled = await Promise.allSettled(
      ids.map((id) => fetchItem(id, itemController.signal))
    );
    clearTimeout(itemTimeout);

    const stories = settled
      .filter((r) => r.status === "fulfilled" && r.value?.title)
      .map((r) => normalizeStory(r.value));

    return new Response(JSON.stringify({ stories, meta: { ...edgeMeta, fetchedAt: Date.now(), count: stories.length, feed } }), {
      status: 200,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
        "Vary": "Accept-Encoding",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch news", detail: err.message }),
      { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders() } }
    );
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
