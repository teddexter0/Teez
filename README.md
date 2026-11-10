# Teez

The internet, on your time. Teez is a finite pop-culture briefing: pick a 5, 10, 15, or 20 minute cap, see a mix of short motion cards and context, and get a clear end to the session.

## Run it

Use Node 22 and npm. No account, API key, database, or environment file is needed.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. `npm run build` creates the production build. With Chrome installed, `npm test` checks the production flow (build first).

## What’s in the demo

- Thirty curated stories across slang, memes, music, style, fandom, tech, creators, and lifestyle. Platform labels identify where the topic circulated; no third-party posts are embedded or scraped.
- Original silent motion cards with example usage. Each clip stays under ten seconds; the planner adds a separate reading beat within the selected session cap. Previously unseen topics get priority and each briefing ends without repeats.
- A dated journal with learned trends, bookmarks, personal notes, tags, and uploaded covers. Entries and images live in this browser, with sample editions clearly marked. Clearing browser storage removes personal entries; there is no cloud sync.
- Prewritten editorial context models the intended AI explanation. The public demo makes no AI or platform API calls.

## Data and future integrations

`lib/catalog.ts` contains the editorial edition; `lib/briefing.ts` composes finite sessions; `lib/journal.ts` validates and stores the local journal. `lib/sources.ts` separates discovery signals, editorial context, and media rights. It defines the active local demo adapter and a disabled provider registry for YouTube, Reddit, Google Trends, TikTok, Instagram, and X.

To add a provider, implement the adapter on the server using an official API or approved embed. Treat discovery as evidence, not permission to reuse media. Keep credentials server-side, verify access/quotas, and use licensed assets, permitted embed segments, or links. Require dated evidence for a trend’s origin and resurgence; where it is disputed, say so. Firebase and a live model can be added independently if account sync or automated editorial updates become necessary.
