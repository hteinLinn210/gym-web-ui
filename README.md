# Erik's Master Plan - Gym Automation System

A premium, automated gym workout logger and progressive overload tracking application custom-tailored for the **12-Week Aesthetic Master Plan**.

## Core Features
*   **⚖️ Base & Plates Load Separation**: Custom input controls separating machine base weights from loaded plates. Automatically calculates double-load multipliers for two-sided plate-loaded machines.
*   **🤖 AI-Powered Subagent Analysis**: Completing a workout triggers a parallel Multi-Agent analysis pipeline:
    *   **Kinesiologist Agent**: Computes total session work capacity (volume), reviews progressive overload achievements, and schedules next week's double progression checklist.
    *   **Nutritionist Agent**: Provides targeted macronutrient, hydration, and timing advice based on the specific muscle groups trained.
    *   **Hype-Man Agent**: Delivers high-energy motivational callouts.
*   **🔒 Showcase & Owner Modes**: Supports a read-only **Showcase Mode** allowing visitors to view logged workouts and AI reports, while locking workout logging, edits, and deletions behind a secure, passcode-locked **Owner Mode** (verified via Next.js API routes).
*   **💾 Persistent Drafts**: Seamlessly save drafts during your gym session without redirecting, automatically updating the active draft record in the background.
*   **🎨 Premium Neue Montreal Aesthetics**: A clean editorial design featuring a glassmorphic layout, a responsive mobile layout, custom load transitions, and a **WebGL SideRays** volumetric lighting background shader.

## Tech Stack
*   **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS, Lucide Icons, OGL (WebGL)
*   **Database**: Supabase (Cloud PostgreSQL) & Node SQLite (Local Synchronization)
*   **Integration**: Model Context Protocol (MCP) Server for agentic automation
