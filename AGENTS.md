<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Windows & Node v24 Installation
When running Node v24+ on Windows environments without C++ Build Tools or Python:
- Install packages using `npm install --ignore-scripts` to bypass `better-sqlite3` native compilation (its Node-API prebuilt binary is already packaged and works perfectly).
- Manually run `npx prisma generate` afterwards to generate the Prisma client.
