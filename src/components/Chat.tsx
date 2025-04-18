
import { useEffect, useRef, useState } from "react";
import { Message, ModelInfo, createChatCompletionStream } from "@/services/api";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ChatProps {
  models: ModelInfo[];
}

const Chat = ({ models }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("Provider-3/gpt-4.1-mini");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (models.length > 0 && !models.some(m => m.id === selectedModel)) {
      setSelectedModel(models[0].id);
    }
  }, [models, selectedModel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (content: string, attachment?: File) => {
    if (isLoading) return;

    let messageContent = content;
    
    // If attachment exists, handle it
    if (attachment) {
      // For text files, try to read and include content
      if (attachment.type === "text/plain" || 
          attachment.name.endsWith(".js") || 
          attachment.name.endsWith(".py") ||
          attachment.name.endsWith(".html") ||
          attachment.name.endsWith(".css") ||
          attachment.name.endsWith(".json")) {
        try {
          const text = await attachment.text();
          const fileExtension = attachment.name.split('.').pop() || 'text';
          messageContent += `\n\nAttached file (${attachment.name}):\n\`\`\`${fileExtension}\n${text}\n\`\`\``;
        } catch (error) {
          console.error("Error reading file:", error);
          toast.error("Could not read the attached file");
        }
      } else {
        // For non-text files just mention the attachment
        messageContent += `\n\nI've attached a file named "${attachment.name}"`;
      }
    }

    const userMessage: Message = { role: "user", content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    let assistantMessage: Message = {
      role: "assistant",
      content: "",
    };

    try {
      setMessages((prev) => [...prev, assistantMessage]);

      await createChatCompletionStream(
        {
          model: selectedModel,
          messages: [...messages, userMessage],
          temperature: 0.7,
        },
        (chunk) => {
          const content = chunk.choices[0]?.delta?.content || "";
          
          assistantMessage = {
            ...assistantMessage,
            content: assistantMessage.content + content,
          };
          
          setMessages((prev) => [
            ...prev.slice(0, -1),
            assistantMessage,
          ]);
        },
        () => {
          setIsLoading(false);
        },
        (error) => {
          toast.error(`API Error: ${error.message}`);
          setIsLoading(false);
          setMessages((prev) => [
            ...prev.slice(0, -1),
            {
              role: "assistant",
              content: "I encountered an error processing your request. Please try again.",
            },
          ]);
        }
      );
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error("Failed to get response from API");
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  };

  return (
    <div className="chat-container">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold gradient-text">BetaChat</h2>
          <ModelSelector 
            models={models} 
            selectedModel={selectedModel} 
            onSelectModel={setSelectedModel} 
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleClearChat}
          disabled={messages.length === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="message-container">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold gradient-text">Welcome to BetaChat</h3>
              <p className="text-muted-foreground">
                Start a conversation with one of our advanced AI models
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-start my-4">
            <div className="bg-secondary rounded-lg p-4 mr-12 flex items-start gap-4">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default Chat;
