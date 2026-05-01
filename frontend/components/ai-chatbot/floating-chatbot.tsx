"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  Send,
  Sparkles,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Maximize2,
} from "lucide-react";
import { useSidebar } from "@/components/sidebar/sidebar-context";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  reasoning?: string;
}

const suggestedQuestions = [
  { icon: AlertTriangle, text: "Why is Conveyor failing?" },
  { icon: TrendingUp, text: "Predict next failure" },
  { icon: Sparkles, text: "System health" },
  { icon: Wrench, text: "Maintenance due?" },
];

const generateResponse = (message: string): { content: string; reasoning: string } => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("conveyor") || lowerMessage.includes("delta") || lowerMessage.includes("failing")) {
    return {
      reasoning: "Analyzing sensor data...",
      content: `**Conveyor Line Delta Analysis**

Critical issues detected:
- **Belt Temperature:** 92°C (Critical)
- **Motor Vibration:** 7.8 mm/s (Critical)

**Actions:** Reduce speed 30%, check alignment, inspect bearings.`,
    };
  }

  if (lowerMessage.includes("predict") || lowerMessage.includes("failure")) {
    return {
      reasoning: "Running predictive models...",
      content: `**Failure Predictions:**

- **Conveyor Delta:** 24-48 hours (Critical)
- **Hydraulic Press Beta:** 7-14 days (Medium)
- **CNC Mill Alpha:** 45+ days (Low)`,
    };
  }

  if (lowerMessage.includes("health") || lowerMessage.includes("status")) {
    return {
      reasoning: "Aggregating system data...",
      content: `**System Health: 92%**

- Operational: 21 machines
- Warning: 1 machine
- Critical: 2 machines
- Efficiency: 87.5%`,
    };
  }

  if (lowerMessage.includes("maintenance") || lowerMessage.includes("due")) {
    return {
      reasoning: "Checking schedules...",
      content: `**Maintenance Schedule:**

**Overdue:** Conveyor Delta
**This Week:** Hydraulic Press Beta
**This Month:** CNC Mill Alpha`,
    };
  }

  return {
    reasoning: "Processing...",
    content: `I can help with machine diagnostics, predictions, system health, and maintenance schedules. What do you need?`,
  };
};

export function FloatingChatbot() {
  const { chatbotOpen, setChatbotOpen } = useSidebar();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI assistant. How can I help with your industrial systems?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const response = generateResponse(input);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      reasoning: response.reasoning,
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMessage]);
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!chatbotOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6"
          >
            <Button
              onClick={() => setChatbotOpen(true)}
              className="h-12 w-12 rounded-full bg-primary shadow-lg hover:bg-primary/90 sm:h-14 sm:w-14"
            >
              <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="sr-only">Open AI Assistant</span>
            </Button>
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 sm:h-4 sm:w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-full w-full rounded-full bg-success" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {chatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "fixed z-50 flex flex-col rounded-2xl border border-border bg-card shadow-2xl",
              "bottom-4 right-4 left-4 top-20",
              "sm:bottom-6 sm:right-6 sm:left-auto sm:top-auto sm:h-[500px] sm:w-[360px]",
              "md:h-[550px] md:w-[400px]"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">NEXUS AI</h3>
                  <p className="text-[10px] text-muted-foreground">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link href="/assistant">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    onClick={() => setChatbotOpen(false)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setChatbotOpen(false)}
                  className="h-8 w-8 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 overflow-hidden" ref={scrollRef}>
              <div className="space-y-3 p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {message.reasoning && (
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] opacity-70">
                          <Sparkles className="h-3 w-3" />
                          <span className="italic">{message.reasoning}</span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "text-sm leading-relaxed",
                          message.role === "user"
                            ? "text-primary-foreground"
                            : "text-card-foreground"
                        )}
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\n/g, "<br />"),
                        }}
                      />
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex gap-1 rounded-2xl bg-muted px-3 py-2">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggestions */}
            {messages.length <= 2 && (
              <div className="border-t border-border px-3 py-2">
                <div className="flex flex-wrap gap-1.5">
                  {suggestedQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setInput(q.text)}
                      className="h-7 gap-1 px-2 text-[11px]"
                    >
                      <q.icon className="h-3 w-3" />
                      {q.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="h-9 flex-1 text-sm"
                />
                <Button type="submit" size="icon" disabled={!input.trim()} className="h-9 w-9">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
