import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prompt } from "@/lib/prompt";

export async function POST(request: NextRequest) {
  try {
    const client = new OpenAI();

    const response = await client.realtime.clientSecrets.create({
      session: {
        type: "realtime",
        model: "gpt-realtime",
        audio: {
          output: {
            voice: "cedar",
          },
        },
        instructions: prompt,
      },
    });

    return NextResponse.json({
      apiKey: response.value,
    });
  } catch (error) {
    console.error("Error creating realtime session:", error);
    return NextResponse.json(
      { error: "Failed to create realtime session" },
      { status: 500 }
    );
  }
}
