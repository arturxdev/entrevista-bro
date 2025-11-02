"use client";
import { useState } from "react";
import {
  RealtimeAgent,
  RealtimeItem,
  RealtimeSession,
} from "@openai/agents-realtime";
import { createAudio, sounds } from "@/lib/audio";
import { MessageItem } from "@/components/messaging";
import { Copy, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Función para obtener la API key desde nuestro endpoint
async function getRealtimeApiKey(): Promise<string> {
  const response = await fetch("/api/realtime-key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get realtime API key");
  }

  const data = await response.json();
  return data.apiKey;
}
export default function Home() {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<RealtimeSession | null>(null);
  const [history, setHistory] = useState<RealtimeItem[]>([
    {
      itemId: "item_CVlAPdi4yo6kV06ag6T1X",
      previousItemId: null,
      type: "message",
      role: "user",
      status: "completed",
      content: [
        {
          type: "input_audio",
          audio: null,
          transcript: "Hola, hola, ¿cómo estás?",
        },
      ],
    },
    {
      itemId: "item_CVlARvVjuVVptmaRdi3Wk",
      type: "message",
      role: "assistant",
      status: "completed",
      content: [
        {
          type: "output_audio",
          transcript:
            "Hola, hola, ¿qué tal? Me llamo Alex, soy un entrevistador especializado en posiciones de backend. Me gustaría comenzar la entrevista pidiéndote que te presentes y me cuentes un poco sobre tu experiencia con las siguientes tecnologías: Node.js, Express, MongoDB, PostgreSQL, Docker, Kubernetes, AWS, Git y GitHub. ¿Te parece bien?",
          audio: null,
        },
      ],
    },
    {
      itemId: "item_CVlAraD5uDXt5Wtz7IB8p",
      previousItemId: "item_CVlARvVjuVVptmaRdi3Wk",
      type: "message",
      role: "user",
      status: "completed",
      content: [
        {
          type: "input_audio",
          transcript: "Mi nombre es Arturo, tengo veintisiete años.",
          audio: null,
        },
      ],
    },
    {
      itemId: "item_CVlAvzFEz1HPiVGH4Gg81",
      type: "message",
      role: "assistant",
      status: "completed",
      content: [
        {
          type: "output_audio",
          transcript:
            "Mucho gusto, Arturo. Cuéntame, ¿cuál ha sido tu experiencia trabajando con las tecnologías como Node.js, Express, MongoDB, PostgreSQL, Docker, Kubernetes, AWS, Git y GitHub?",
          audio: null,
        },
      ],
    },
  ]);
  const [usage, setUsage] = useState<any[]>([]);

  return (
    <div className="w-3/4 mx-auto">
      <div className="flex flex-col items-center h-screen">
        <div className="mb-8 text-center mt-16">
          <h1 className="text-6xl font-bold text-secondary-foreground mb-4">
            Practica tu entrevista en ingles
          </h1>
          <p className="text-xl text-muted-foreground">
            Mejora tus habilidades técnicas con entrevistas simuladas por IA
          </p>
        </div>
        {session && !loading ? (
          <Button
            variant="destructive"
            className="z-10 dark:bg-error-solid dark:text-white dark:hover:bg-error-solid_hover dark:shadow-xs-skeumorphic dark:ring-1 dark:ring-transparent dark:ring-inset dark:before:absolute dark:before:inset-px dark:before:border dark:before:border-white/12 dark:before:mask-b-from-0%"
            size="lg"
            onClick={() => {
              session.close();
              setSession(null);
              console.log("uso del agente", usage);
            }}
          >
            <PhoneOff />
            Terminar llamada
          </Button>
        ) : (
          <Button
            disabled={loading}
            size="lg"
            className="cursor-pointer z-10 dark:bg-brand-solid dark:text-white dark:hover:bg-brand-solid_hover dark:shadow-xs-skeumorphic dark:ring-1 dark:ring-transparent dark:ring-inset dark:before:absolute dark:before:inset-px dark:before:border dark:before:border-white/12 dark:before:mask-b-from-0%"
            onClick={async () => {
              const audio = createAudio(sounds.dialing, { loop: true });
              audio.play();
              setLoading(true);

              const agent = new RealtimeAgent({
                name: "Agent",
              });

              const session = new RealtimeSession(agent);
              setSession(session);

              session.on("history_updated", (event) => {
                setHistory(event);
                console.log("historial", event);
              });
              session.on("agent_end", (event) => {
                setUsage((prev) => [...prev, event.usage]);
                console.log("uso del agente", usage);
              });

              const apiKey = await getRealtimeApiKey();
              await session.connect({
                apiKey: apiKey,
              });

              setLoading(false);
              createAudio(sounds.connected, { volume: 0.7 }).play();
              audio.stop();
            }}
          >
            <Phone />
            {loading ? "llamando..." : "Iniciar llamada"}
          </Button>
        )}
        {/* History */}
        <div className="w-full max-w-4xl mx-auto mt-4">
          <div className="rounded-lg p-6 overflow-y-auto bg-gray-50 border border-gray-200">
            <div className="flex justify-end">
              <Button
                variant="secondary"
                className="cursor-pointer"
                onClick={async () => {
                  const formattedConversation = history
                    .filter((item) => item.type === "message")
                    .map((item) => {
                      const text = item.content
                        .map((c) => {
                          if (
                            c.type === "input_audio" ||
                            c.type === "output_audio"
                          ) {
                            return c.transcript;
                          }

                          if (
                            c.type === "input_text" ||
                            c.type === "output_text"
                          ) {
                            return c.text;
                          }

                          return "";
                        })
                        .filter(Boolean)
                        .join("\n");

                      const speaker = item.role === "user" ? "tu" : "agente";
                      return `${speaker}: ${text}`;
                    })
                    .join("\n\n");

                  try {
                    await navigator.clipboard.writeText(formattedConversation);
                    // Optional: Show a toast notification here
                    console.log("Conversación copiada al clipboard");
                    toast.info("Platica copiada");
                  } catch (err) {
                    console.error("Error al copiar al clipboard:", err);
                  }
                }}
              >
                <Copy />
                Copiar
              </Button>
            </div>
            <ol className="space-y-4">
              {history.map((item) => {
                if (item.type === "message") {
                  const text = item.content
                    .map((c) => {
                      if (
                        c.type === "input_audio" ||
                        c.type === "output_audio"
                      ) {
                        return c.transcript;
                      }

                      if (c.type === "input_text" || c.type === "output_text") {
                        return c.text;
                      }

                      return "";
                    })
                    .filter(Boolean)
                    .join("\n");

                  return (
                    <MessageItem
                      key={item.itemId}
                      msg={{
                        id: item.itemId,
                        text,
                        user: {
                          me: item.role === "user",
                          name: item.role === "user" ? "You" : "Agent",
                        },
                      }}
                    />
                  );
                } else {
                  return (
                    <div
                      key={item.itemId}
                      className="rounded-lg bg-gray-100 dark:bg-bg-tertiary text-xs p-2 overflow-x-scroll text-fg-primary dark:text-fg-primary"
                    >
                      <pre>{JSON.stringify(item, null, 2)}</pre>
                    </div>
                  );
                }
              })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
