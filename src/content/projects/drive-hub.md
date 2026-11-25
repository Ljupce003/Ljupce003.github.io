---
slug: drive-hub
order: 1
title: "DriveHub – Driving School Management Platform"
description: "DriveHub is a full-stack driving-school platform I built in a team with Bojana Jovancheva. It brings school discovery, licence applications, training progress, lesson scheduling, and real-time communication into one application."
technologies:
  - Nuxt 4
  - Vue 3
  - TypeScript
  - PostgreSQL 17
  - Prisma 7
  - Node.js
  - Nitro
  - nuxt-auth-utils
  - Zod
  - WebSockets
  - Docker Compose
  - Nginx
  - Node.js Test Runner
github: "https://github.com/bjovanceva/drive-hub"
demo: "https://drive-hub.ljupchoangelovski.com"
demoStatusUrl: "https://drive-hub.ljupchoangelovski.com/health"
---

DriveHub is a full-stack driving-school platform I built in a team with Bojana Jovancheva. It brings school discovery, licence applications, training progress, lesson scheduling, and real-time communication into one application.

Applicants, students, instructors, school managers, and administrators have dedicated workspaces with role-based access. The platform includes a searchable school directory, curriculum-based theory and practical training, scheduling conflict validation, school and vehicle management, and persistent private and group chat.

Server-rendered Nuxt pages and a Nitro API connect to PostgreSQL through Prisma, with cookie-based authentication, server-side authorization, Zod request validation, and authenticated WebSockets. The code is organized into reusable Vue components, composables, services, and repositories, with unit, database integration, and HTTP regression tests. Docker Compose supports containerized deployment and database migrations, with Nginx reverse-proxy support for HTTPS and WebSocket connections.
