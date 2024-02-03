# 🧩 Beatmods 2

Why are you looking at this? Nothing is ready yet please go away and no leaking!

# 🚀 Project Setup Guide

Follow these steps to set up and run the project on your local machine.

## 1. Clone the Project

Clone the project repository to your local machine using the following command:

```bash
git clone https://github.com/rithik-b/beatmods.git
```

## 2. Install Dependencies

Navigate to the project directory and install the required dependencies:

```bash
cd beatmods
bun i
```

## 3. Start Supabase

Start the Supabase development local development stack using the following command:

```bash
bunx supabase start
```

## 4. Configure Environment Variables

Copy the provided example environment file to create your own configuration:

```bash
cp .env.example .env
```

Open the `.env` file and replace the placeholder values with the details obtained from the Supabase start command.

## 5. Create GitHub OAuth App

Visit [GitHub Developer Settings](https://github.com/settings/applications/new) to create a new OAuth app. Fill in the required information, and set the callback URL to:

```
{REPLACE_WITH_YOUR_SUPABASE_API_URL}/auth/v1/callback
```
