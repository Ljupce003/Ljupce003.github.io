---
slug: study-organizer
order: 2
title: "StudyOrganizer – Learning Management System for Courses, Assignments, and Submissions"
description: "StudyOrganizer is a full-stack Learning Management System (LMS) that allows professors to manage courses, publish assignments, upload learning materials, and grade student submissions, while students can submit multiple attempts with attachments and track their progress."
technologies:
  - Laravel
  - PHP
  - Blade
  - Tailwind CSS
  - Laravel Breeze
  - Filament (Admin Panel)
  - SQLite
  - Postgres(hosted on Docker for local dev)
  - Markdown (EasyMDE)
  - Nginx
  - AWS EC2
  - AWS RDS
  - Cloudflare
  - Certbot HTTPS
github: "https://github.com/Ljupce003/StudyOrganizer"
demo:
  - "https://studyorganizer.ljupchoangelovski.com"
  - "ec2-35-157-32-151.eu-central-1.compute.amazonaws.com"
demoStatusUrl: "https://studyorganizer.ljupchoangelovski.com/health"
---

StudyOrganizer is a full-stack Learning Management System (LMS) that allows professors to manage courses, publish assignments, upload learning materials, and grade student submissions, while students can submit multiple attempts with attachments and track their progress.

The system includes role-based access (student, professor, admin), Markdown-powered notes, course-scoped resources, and an admin panel for managing users and course memberships. The application emphasizes clean architecture, explicit routing, authorization policies, and secure file handling. It is deployed on AWS with an automated provisioning script that configures Nginx, PHP-FPM, HTTPS, and the full Laravel stack.
