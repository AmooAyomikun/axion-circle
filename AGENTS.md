# CleanReport / Axion Circle — Agent Instructions

## Environment
- GitHub: $GITHUB_PERSONAL_ACCESS_TOKEN
- Memory: $MEM0_API_KEY (user: bne) — LOAD FIRST

## CRITICAL DEPLOYMENT RULE
ALWAYS push to BOTH or Render won't deploy:
  git push origin main
  git push fork main   # BOUTCHOUANG1/axion-circle

## Stack
Backend: Spring Boot 3.x, Java 21, Neon DB
  JDBC URL: must include &stringtype=unspecified
  DB host: ep-broad-hill-ahqjr454-pooler.c-3.us-east-1.aws.neon.tech/neondb
  Render service: srv-d9ah7iernols73b200l0
  Live API: https://cleanreport-api.onrender.com/api/v1

Frontend: Next.js 14, TypeScript strict, Tailwind CSS
Deploy: Vercel (frontend), Render (backend)

## Task Entry
Use /cleanreport-feature for every feature.
