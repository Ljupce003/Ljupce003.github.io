---
slug: news-aggregator-bookmark-manager
order: 6
title: "News Aggregator & Bookmark Manager"
description: "A full-stack ASP.NET Core web application that aggregates news articles from external APIs and allows users to organize them into a personal knowledge collection with folder grouping and Excel export."
technologies:
  - ASP.NET Core
  - C#
  - Razor Pages / CSHTML
  - Onion Architecture
  - SQL Server
  - Entity Framework Core
  - REST API Integration
  - Azure App Service
  - Azure SQL Database
  - Excel Export (ClosedXML)
github: "https://github.com/Ljupce003/ISproject"
demo:
  - "https://isproject.ljupchoangelovski.com"
  - "https://isprojectweb20250823163857-b3btc6aeawbehfb2.switzerlandnorth-01.azurewebsites.net"
---

A full-stack ASP.NET Core web application that aggregates news articles from external APIs and allows users to organize them into a personal knowledge collection. Users can bookmark individual articles, group bookmarks into folders, and export selected collections to Excel for offline use.

The application follows Onion Architecture with separated Domain, Repository, and Service layers, uses SQL Server for persistent storage, Razor (CSHTML) views for the UI, and integrates external news APIs for real-time content. The system was deployed on Microsoft Azure with both the web application and database hosted in the cloud.
