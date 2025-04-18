import { toast } from "sonner";

// Beta API Configuration
const API_KEY = "ddc-beta-de1h8eejpi-9gfZP2ZdON52DWHpMXnnefN7WlnK9I77KAE";
const BASE_URL = "https://beta.sree.shop/v1";

// Types
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ModelInfo {
  id: string;
  provider: string;
  costPerMillion: number | null;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: Partial<Message>;
    finish_reason: string | null;
  }[];
}

// API methods
export const fetchModels = async (): Promise<ModelInfo[]> => {
  try {
    const response = await fetch("/models.json");
    const data = await response.json();
    return data.data.map((model: any) => ({
      id: model.id,
      provider: model.id.split('/')[0],
      costPerMillion: model.owner_cost_per_million_tokens,
    }));
  } catch (error) {
    console.error("Error fetching models:", error);
    toast.error("Failed to load available models");
    return [];
  }
};

export const createChatCompletion = async (
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Unknown API error");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in chat completion:", error);
    toast.error("Failed to get response from API");
    throw error;
  }
};

export const createChatCompletionStream = async (
  request: ChatCompletionRequest,
  onChunk: (chunk: ChatCompletionChunk) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ ...request, stream: true }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Unknown API error");
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    let buffer = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      
      if (done) {
        onDone();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data:")) {
          const data = line.slice(5).trim();
          if (data === "[DONE]") {
            onDone();
            break;
          }
          try {
            const chunk = JSON.parse(data) as ChatCompletionChunk;
            onChunk(chunk);
          } catch (e) {
            console.warn("Failed to parse chunk:", data, e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in streaming chat completion:", error);
    onError(error instanceof Error ? error : new Error("Unknown error"));
  }
};
