"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Heart, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";

type Clip = {
  id: string;
  title: string;
  duration: number;
  width: number;
  height: number;
  image: string;
  video: string;
  source: string;
  sourceUrl?: string;
  tags: string[];
};

const demoClips: Clip[] = [
  {
    id: "demo-1",
    title: "Person walking through city at night",
    duration: 8,
    width: 1280,
    height: 720,
    image: "https://images.pexels.com/videos/38134466/beauty-korean-makeup-model-38134466.jpeg",
    video: "https://videos.pexels.com/video-files/38134466/16190592_360_640_60fps.mp4",
    source: "Demo",
    tags: ["night", "city", "walking", "lonely"]
  },
  {
    id: "demo-2",
    title: "Rain on a city street",
    duration: 6,
    width: 1080,
    height: 1920,
    image: "https://images.pexels.com/videos/6781549/pexels-photo-6781549.jpeg",
    video: "https://videos.pexels.com/video-files/6781549/6781549-sd_640_360_30fps.mp4",
    source: "Demo",
    tags: ["rain", "street", "night", "moody"]
  },
  {
    id: "demo-3",
    title: "Ocean waves close up",
    duration: 7,
    width: 1920,
    height: 1080,
    image: "https://images.pexels.com/videos/7894357/active-adult-beautiful-body-7894357.jpeg",
    video: "https://videos.pexels.com/video-files/7894357/7894357-sd_960_506_25fps.mp4",
    source: "Demo",
    tags: ["ocean", "waves", "nature", "calm"]
  },
  {
    id: "demo-4",
    title: "Person looking out a window",
    duration: 5,
    width: 1080,
    height: 1920,
    image: "https://images.pexels.com/videos/36526809/pexels-photo-36526809.jpeg",
    video: "https://videos.pexels.com/video-files/36526809/15488608_640_360_30fps.mp4",
    source: "Demo",
    tags: ["person", "window", "thinking", "sad"]
  }
];

const suggestions = [
  "lonely person walking at night",
  "rainy city aesthetic",
  "car driving fast",
  "someone crying",
  "sunset over mountains",
];

const discoverCategories = [
  { label: "🔥 Trending", query: "trending cinematic" },
  { label: "🎬 Cinematic", query: "cinematic" },
  { label: "😢 Emotional", query: "emotional sad person" },
  { label: "🌃 Aesthetic", query: "aesthetic city night" },
  { label: "🏎️ Action", query: "action car driving" },
  { label: "🌿 Nature", query: "beautiful nature" },
  { label: "👤 People", query: "people lifestyle" },
  { label: "🌙 Dark / Moody", query: "dark moody cinematic" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [clips, setClips] = useState<Clip[]>(demoClips);
  const [loading, setLoading] = useState(false);
  const [orientation, setOrientation] = useState("all");
  const [maxDuration, setMaxDuration] = useState("30");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    const randomSuggestions = [
      "cinematic",
      "city night",
      "nature",
      "people",
      "travel",
      "ocean",
      "car driving",
      "rain",
      "sunset",
      "street",
    ];

    const randomQuery =
      randomSuggestions[
        Math.floor(Math.random() * randomSuggestions.length)
      ];

    async function loadHomepageClips() {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          q: randomQuery,
          orientation: "all",
          maxDuration: "30",
        });

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();

        if (Array.isArray(data.clips) && data.clips.length > 0) {
          const randomClips = [...data.clips]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4)
            .map((clip: Clip) => ({
              ...clip,
              tags: Array.isArray(clip.tags) ? clip.tags : [],
            }));

          setClips(randomClips);
        }
      } catch (error) {
        console.error("Homepage clips failed to load:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHomepageClips();
  }, []);
    async function loadCategory(categoryQuery: string) {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        q: categoryQuery,
        orientation,
        maxDuration,
      });

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (Array.isArray(data.clips) && data.clips.length > 0) {
        const categoryClips = [...data.clips]
          .sort(() => Math.random() - 0.5)
          .slice(0, 4)
          .map((clip: Clip) => ({
            ...clip,
            tags: Array.isArray(clip.tags) ? clip.tags : [],
          }));

        setClips(categoryClips);
      }
    } catch (error) {
      console.error("Category search failed:", error);
    } finally {
      setLoading(false);
    }
  }
  async function search(e?: FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (orientation !== "all") params.set("orientation", orientation);
      params.set("maxDuration", maxDuration);
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setClips(
  Array.isArray(data.clips)
    ? data.clips.map((clip: Clip) => ({
        ...clip,
        tags: Array.isArray(clip.tags) ? clip.tags : [],
      }))
    : demoClips
);
    } catch {
      setClips(demoClips);
    } finally {
      setLoading(false);
    }
  }

  const visible = useMemo(() => clips.filter(c => {
    if (orientation === "vertical") return c.height > c.width;
    if (orientation === "horizontal") return c.width >= c.height;
    return true;
  }).filter(c => c.duration <= Number(maxDuration)), [clips, orientation, maxDuration]);

  function toggleFavorite(id: string) {
    setFavorites(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id]);
  }

  return (
    <main>
      <header className="nav">
        <div className="brand"><span className="logo">C</span> ClipFinder</div>
        <div className="navLinks"><span>Discover</span><span>Favorites {favorites.length ? `(${favorites.length})` : ""}</span></div>
      </header>

      <section className="hero">
        <div className="eyebrow"><Sparkles size={15}/> SEARCH FOR THE PERFECT SHOT</div>
        <h1>Find the clip.<br/><em>Make the edit.</em></h1>
        <p>Describe the moment you need and discover short video clips that fit your edit.</p>

        <form className="searchBox" onSubmit={search}>
          <Search size={22}/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Try “lonely person walking in the rain…”" />
          {query && <button type="button" className="clear" onClick={() => setQuery("")}><X size={18}/></button>}
          <button className="searchBtn" disabled={loading}>{loading ? "Searching…" : "Search"}</button>
        </form>

        <div className="suggestions">
          {suggestions.map(s => <button key={s} onClick={() => { setQuery(s); setTimeout(() => search(), 0); }}>{s}</button>)}
                </div>

        <div className="discover-categories">
          <div className="discover-heading">
            <div>
              <h2>Discover</h2>
              <p>Find inspiration for your next edit.</p>
            </div>
          </div>

          <div className="category-list">
            {discoverCategories.map((category) => (
              <button
                key={category.label}
                type="button"
                onClick={() => loadCategory(category.query)}
                disabled={loading}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="results">
        <div className="toolbar">
          <div><strong>{visible.length}</strong> clips <span className="muted">for {query ? `“${query}”` : "your next edit"}</span></div>
          <button className="filterBtn" onClick={() => setShowFilters(v => !v)}><SlidersHorizontal size={17}/> Filters</button>
        </div>

        {showFilters && (
          <div className="filters">
            <label>Orientation
              <select value={orientation} onChange={e => setOrientation(e.target.value)}>
                <option value="all">All</option><option value="vertical">Vertical 9:16</option><option value="horizontal">Landscape 16:9</option>
              </select>
            </label>
            <label>Max duration
              <select value={maxDuration} onChange={e => setMaxDuration(e.target.value)}>
                <option value="10">10 sec</option><option value="20">20 sec</option><option value="30">30 sec</option><option value="60">60 sec</option>
              </select>
            </label>
          </div>
        )}

        <div className="grid">
          {visible.map(clip => (
            <article className="card" key={clip.id}>
              <div className="preview">
                <video
  src={clip.video}
  poster={clip.image}
  muted
  loop
  playsInline
  onMouseEnter={(e) => {
    const video = e.currentTarget;
    video.play().catch(() => {});
  }}
  onMouseLeave={(e) => {
    e.currentTarget.pause();
  }}
/>
                <div className="duration">{clip.duration}s</div>
                <button className={`heart ${favorites.includes(clip.id) ? "liked" : ""}`} onClick={() => toggleFavorite(clip.id)}><Heart size={18} fill={favorites.includes(clip.id) ? "currentColor" : "none"}/></button>
              </div>
              <div className="cardBody">
                <h3>{clip.title}</h3>
                <div className="tags">{clip.tags.slice(0,3).map(t => <span key={t}>{t}</span>)}</div>
                <a className="download" href={clip.video} target="_blank" rel="noreferrer"><Download size={16}/> Open clip</a>
              </div>
            </article>
          ))}
        </div>

        {!visible.length && <div className="empty">No clips matched those filters. Try a broader search.</div>}
      </section>

      <footer>ClipFinder MVP · Built for editors · Connect a licensed video API to power production search.</footer>
    </main>
  );
}