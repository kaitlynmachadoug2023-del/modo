# MODO: Your mood. Your move.

A health and wellness web app for people who don't like fitness apps. You don't pick a workout. You say how you feel, and MODO finds movement you'll actually want to do. After the session, it helps you make a meal from whatever is in your fridge.

## The flow

1. **How are we feeling?** Seven moods: Dead, Meh, Restless, Overwhelmed, Energized, Low, I need to move.
2. **Three quick questions.** How much suffering, how much time, where you are.
3. **Swipe feed.** Each card is an experience ("Angry walk", "Colony cricket", "Basketball chaos"), not a workout. Every swipe teaches MODO what you like.
4. **"We found your move."** A timed plan with a reason it was picked, the mood you'll likely feel after, an effort score and the time it takes.
5. **Session player.** A step-by-step timer. Demo speed runs 1 second as 1 minute.
6. **How do you feel now?** A before → after mood check. Over time: "Moving lifted your mood 9 of 11 times."
7. **Refuel.** Snap your fridge, try the sample fridge or type what you have. MODO suggests Indian home-style meals that fit your meal window (Mifflin-St Jeor + calories burned). Calories can be hidden.

Extras:

- **"I don't want to exercise."** A big button that gives you sneaky challenges like "Go outside and find a dog."
- **MODO knows you.** A taste profile built from your swipes: you hate / like / tolerate / secretly love.
- **Context aware.** Live weather and AQI (Open-Meteo, no key needed). Bad air or rain moves you indoors.
- **Watch connect.** Apple Watch, Garmin, Fitbit, WHOOP and Noise flows use **clearly labelled demo readings**. Short sleep caps effort at 6/10. Real sync needs a native app (HealthKit and others have no web API).

## AI

- With `ANTHROPIC_API_KEY` set, `/api/ai` uses Claude for two things: reading fridge photos (vision) and inventing a "chef's special" from what you have.
- Without a key, everything still works. Photos fall back to a quick tap-to-pick list. Matching, plans and recipes run on a local engine (`src/engine.js`).

## Deploy to Vercel (about 5 minutes)

**Option A: from GitHub**

1. Create a new GitHub repo and upload the contents of `dist/web/` (`index.html`, `api/`, `package.json`).
2. On vercel.com: **Add New → Project**, import the repo, and keep the defaults (no framework, no build command).
3. Optional: under **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` (from console.anthropic.com), then redeploy.
4. Your link looks like `modo-yourname.vercel.app`.

**Option B: from your terminal**

```bash
cd dist/web
npx vercel            # log in, accept the defaults
npx vercel env add ANTHROPIC_API_KEY   # optional
npx vercel --prod
```

Optional: set `ANTHROPIC_MODEL` to override the default model (`claude-sonnet-4-5`).

## Develop

```bash
node build.mjs                       # writes dist/web/ and dist/artifact.html
cd dist/web && python3 -m http.server 8000
```

- `src/data.js`: moods, 32 activities, 14 "trick" challenges, 25 recipes, ingredient synonyms (dahi → curd, anda → egg, …)
- `src/engine.js`: scoring, plan builder, taste learning, meal-window maths, recipe matching
- `src/ai.js`: Claude adapter + live weather, each with an offline fallback
- `src/app.js`: UI (Preact + htm, no build step)
- `api/`: serverless routes (`health`, `ai`) that keep the API key server-side

Your data stays in your browser (localStorage). There are no accounts and no tracking.
