import { useState, FormEvent, KeyboardEvent, useRef } from "react";
import { Send, PaperclipIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PaperclipIcon as Paperclip } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string, attachment?: File) => void;
  disabled: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message, attachment || undefined);
      setMessage("");
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("File is too large. Maximum size is 5MB.");
        return;
      }
      setAttachment(file);
      toast.success(`File \"${file.name}\" attached`);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative p-4 border-t">
      {attachment && (
        <div className="flex items-center gap-2 p-2 mb-2 bg-secondary rounded-md">
          <span className="text-sm truncate flex-1">{attachment.name}</span>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleRemoveAttachment}
          >
            Remove
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2 w-full">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.pdf,.doc,.docx,.js,.py,.html,.css,.json,.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          disabled={disabled}
        />
        
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="min-h-[60px] resize-none pr-12 flex-1"
          disabled={disabled}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!message.trim() || disabled}
          className="absolute bottom-7 right-6"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;