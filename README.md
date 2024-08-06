# Graph-based Brainstorming Assistant

This repository contains a graph-based brainstorming assistant tool that integrates the SCAMPER ideation framework with a Large Language Model (LLM) to enhance solo brainstorming sessions. The tool aims to reduce instances of fixation and free riding while retaining the benefits of cognitive stimulation and AI facilitation.

## Features

- Graph-based user interface for visualizing and connecting ideas
- Integration with Claude for AI-assisted facilitation
- Implementation of the SCAMPER framework for structured ideation
- Chain-of-thought prompting for improved LLM responses

## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed [Node.js](https://nodejs.org/) (version 14.0.0 or later)
* You have a Windows/Linux/Mac machine

## Installing and Running the Brainstorming Assistant

To install and run this project, follow these steps:

1. Clone the repository
   ```
   git clone https://github.com/pastelcolors/ai-scamper.git
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ```

4. Run the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`


