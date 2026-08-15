import { NextRequest, NextResponse } from "next/server";

type PexelsVideo = {
  id: number;
  duration: number;
  width: number;
  height: number;
  image: string;
  user?: { name?: string };
  url: string;
  video_files: Array<{
    link: string;
    width?: number;
    height?: number;
    quality?: string;
    file_type?: string;
  }>;
};

function createSmartQueries(input: string): string[] {
  const text = input.toLowerCase().trim();

  const queries: string[] = [text];

  const patterns: Array<[string[], string[]]> = [
    [
      ["betray", "betrayed", "backstab", "backstabbed"],
      ["betrayal", "sad person", "shocked person", "argument", "lonely person"],
    ],
    [
      ["heartbreak", "broken heart", "break up", "breakup"],
      ["sad person", "crying person", "lonely person", "couple arguing"],
    ],
    [
      ["happy", "happiness", "celebration", "celebrate"],
      ["happy person", "people celebrating", "smiling person", "party"],
    ],
    [
      ["angry", "anger", "furious", "rage"],
      ["angry person", "argument", "fighting", "frustrated person"],
    ],
    [
      ["scared", "fear", "afraid", "terrified"],
      ["scared person", "fear reaction", "dark hallway", "running"],
    ],
    [
      ["love", "romance", "romantic", "falling in love"],
      ["couple", "romantic couple", "love", "happy couple"],
    ],
    [
      ["lonely", "alone", "isolation"],
      ["lonely person", "person alone", "sad person", "empty room"],
    ],
    [
      ["night", "midnight", "late night"],
      ["night city", "person at night", "dark street", "night driving"],
    ],
    [
      ["car", "driving", "drive"],
      ["car driving", "person driving", "road", "night driving"],
    ],
    [
      ["cry", "crying", "tears"],
      ["crying person", "sad woman", "sad man", "tears"],
    ],
    [
      ["walk away", "walking away", "leave", "leaving"],
      ["person walking away", "walking alone", "sad person"],
    ],
    [
      ["shock", "shocked", "surprised", "realizes", "realized"],
      ["shocked person", "surprised reaction", "reaction", "confused person"],
    ],
  ];

  for (const [keywords, alternatives] of patterns) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      queries.push(...alternatives);
    }
  }

  // Remove duplicates and keep the search reasonably small.
  return [...new Set(queries)].slice(0, 4);
}

function chooseBestVideoFile(video: PexelsVideo) {
  const files = video.video_files.filter(
    (file) =>
      file.file_type === "video/mp4" ||
      !file.file_type
  );

  // Prefer a reasonably sized HD file.
  return (
    files.find(
      (file) =>
        (file.width ?? 0) >= 720 &&
        (file.width ?? 0) <= 1920
    ) ||
    files[0] ||
    null
  );
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const q = params.get("q")?.trim() || "cinematic";
  const orientation = params.get("orientation") || "all";
  const maxDuration = Number(params.get("maxDuration") || 30);

  const key = process.env.PEXELS_API_KEY;

  if (!key) {
    return NextResponse.json(
      {
        clips: [],
        demo: true,
        message:
          "Add PEXELS_API_KEY to .env.local to enable live search.",
      },
      { status: 500 }
    );
  }

  const queries = createSmartQueries(q);

  try {
    const responses = await Promise.all(
      queries.map(async (query) => {
        const url = new URL(
          "https://api.pexels.com/v1/videos/search"
        );

        url.searchParams.set("query", query);
        url.searchParams.set("per_page", "15");

        if (orientation === "vertical") {
          url.searchParams.set("orientation", "portrait");
        }

        if (orientation === "horizontal") {
          url.searchParams.set("orientation", "landscape");
        }

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: key,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Pexels returned ${response.status}`
          );
        }

        const data = await response.json();

        return (data.videos || []) as PexelsVideo[];
      })
    );

    const allVideos = responses.flat();

    // Remove duplicate videos.
    const uniqueVideos = Array.from(
      new Map(
        allVideos.map((video) => [video.id, video])
      ).values()
    );

    // Respect the maximum duration.
    const filteredVideos = uniqueVideos.filter(
      (video) =>
        !maxDuration ||
        video.duration <= maxDuration
    );

    const clips = filteredVideos
      .map((video) => {
        const file = chooseBestVideoFile(video);

        if (!file) return null;

return {
  id: video.id,
  title: q,
  tags: queries,
  duration: video.duration,
  width: video.width,
  height: video.height,
  image: video.image,
  video: file.link,
  preview: file.link,
  user: {
    name: video.user?.name || "Pexels Creator",
  },
  url: video.url,
  video_files: video.video_files,
};
      })
      .filter(Boolean);

    return NextResponse.json({
      clips,
      smartSearch: true,
      searchQueries: queries,
    });
  } catch (error) {
    console.error("ClipFinder search error:", error);

    return NextResponse.json(
      {
        clips: [],
        error: "Unable to search Pexels right now.",
      },
      { status: 500 }
    );
  }
}