
import { Message } from "@/services/api";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  // Process markdown content to find code blocks
  const renderContent = () => {
    return (
      <ReactMarkdown
        components={{
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "text";
            
            if (!inline && match) {
              return (
                <CodeBlock 
                  language={language} 
                  code={String(children).replace(/\n$/, "")} 
                />
              );
            }
            
            return (
              <code className="px-1 py-0.5 bg-muted rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {message.content}
      </ReactMarkdown>
    );
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} my-4`}>
      <div 
        className={`flex items-start gap-4 max-w-3xl rounded-lg p-4 
          ${isUser 
            ? "bg-primary/10 ml-12 order-2" 
            : "bg-secondary mr-12"
          }`}
      >
        <Avatar className={`h-8 w-8 shrink-0 ${isUser ? "order-2" : "order-1"}`}>
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </Avatar>
        <div className={`flex-1 space-y-2 ${isUser ? "order-1 text-right" : "order-2 text-left"}`}>
          <p className="text-sm font-medium">
            {isUser ? "You" : "Assistant"}
          </p>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
