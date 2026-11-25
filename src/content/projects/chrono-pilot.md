---
slug: chrono-pilot
order: 3
title: "ChronoPilot – Student Planner & Calendar App"
description: "ChronoPilot is a Flutter mobile planner for organizing lectures, tasks, deadlines, and daily activities with day, week, month, and year views and a custom recurrence engine."
technologies:
  - Flutter
  - Dart
  - SQLite (sqflite)
  - Firebase Authentication
  - Google Sign-In
  - Provider
  - REST API Integration
  - Nager.Date API
  - flutter_map / OpenStreetMap
  - Geolocator
  - Image Picker
  - Layered Architecture
  - Custom Calendar & Recurrence Engine
github: "https://github.com/Ljupce003/ChronoPilot"
---

ChronoPilot is a Flutter mobile planner for organizing lectures, tasks, deadlines, and daily activities. It brings one-time events, recurring schedules, educational events, and to-do completion tracking into a single calendar with day, week, month, and year views.

A custom recurrence engine expands schedules only for the selected date range, with support for editing or cancelling individual occurrences without changing the entire series. Custom day and week timelines position events by time and arrange overlapping entries in separate lanes.

Events and recurrence overrides are stored locally in SQLite and scoped to the signed-in user, while Firebase Authentication supports email/password accounts and Google Sign-In. The app imports public holidays by country and year through the Nager.Date REST API, lets users attach locations using GPS and interactive OpenStreetMap maps, and supports camera and gallery images saved in the app's local storage. The code separates presentation, domain models, services, and repositories, with Provider-based reactive state management and light and dark themes.
