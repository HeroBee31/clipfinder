# ClipFinder MVP

A Next.js app for editors to search for short video clips by describing what they need.

## Run locally

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.local.example` to `.env.local`.
4. Add your Pexels API key as `PEXELS_API_KEY`.
5. Run `npm run dev`.
6. Open http://localhost:3000.

Without an API key, the UI still loads with demo clips.

## What is included

- Natural-language-style clip search UI
- Pexels video search API route
- Responsive clip grid
- Hover-to-preview videos
- Favorites in browser memory
- Orientation filter
- Maximum-duration filter
- Mobile-friendly layout

## Important production notes

The MVP intentionally keeps the API key server-side in the Next.js route. Do not expose the provider key in client-side JavaScript.

For a production product, add:
- Supabase authentication + saved favorites
- Semantic search/embeddings for better intent matching
- Provider licensing/attribution checks
- Download proxying or provider-approved download flow
- Search caching/rate limiting
- Moderation and abuse controls
- Multiple licensed clip providers
