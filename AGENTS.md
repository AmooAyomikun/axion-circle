# CleanReport / Axion Circle — Agent Instructions

## Available MCP Tools (use ONLY these)
- `mcp__mem0__*` — long-term memory (load first on every task)
- `mcp__github__*` — GitHub PRs, issues, branches
- `mcp__filesystem__*` — file operations
- `mcp__fetch__*` — HTTP requests

## NOT available for this project
- No YouTrack (that's ECA only)
- No PostgreSQL MCP (use JDBC directly in code, not MCP)
- No Jira (that's CBS only)

## CRITICAL DEPLOYMENT RULE
ALWAYS push to BOTH or Render won't deploy:
```
git push origin main
git push fork main   # BOUTCHOUANG1/axion-circle
```

## Stack
- Backend: Spring Boot 3.x, Java 21
- DB: Neon PostgreSQL — ep-broad-hill-ahqjr454-pooler.c-3.us-east-1.aws.neon.tech/neondb
  - JDBC URL MUST include: &stringtype=unspecified
- Render service: srv-d9ah7iernols73b200l0
- Live API: https://cleanreport-api.onrender.com/api/v1
- Frontend: Next.js 14, TypeScript, Tailwind CSS
- Deploy: Render (backend), Vercel (frontend)

## Task Entry
Use /cleanreport-feature for features. Use /cleanreport-backend or /cleanreport-frontend directly for targeted work.

## Project location
/mnt/c/Users/User/Desktop/axion Circle/repo/
