"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bot,
  Send,
  Sparkles,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Plus,
  MessageSquare,
  Trash2,
  MoreHorizontal,
  Clock,
  Search,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  reasoning?: string;
}

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messages: Message[];
}

const suggestedQuestions = [
  {
    icon: AlertTriangle,
    text: "Why is Air Compressor Delta failing?",
    description: "Diagnose machine issues",
  },
  {
    icon: TrendingUp,
    text: "Predict next failure",
    description: "AI-powered predictions",
  },
  {
    icon: Sparkles,
    text: "Summarize system health",
    description: "Overview of all systems",
  },
  {
    icon: Wrench,
    text: "What maintenance is due?",
    description: "Upcoming schedules",
  },
];

const BASE_CHAT_TIME = new Date('2026-04-14T12:00:00Z');

const generateResponse = (message: string): { content: string; reasoning: string } => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("compressor") || lowerMessage.includes("delta") || lowerMessage.includes("failing")) {
    return {
      reasoning: "Analyzing sensor data from Air Compressor Delta... Detected critical temperature anomaly and elevated vibration patterns.",
      content: `**Analysis: Air Compressor Delta (MCH-004)**

The machine is experiencing two critical issues:

1. **Belt Temperature Critical** (92°C)
   - Exceeded critical threshold of 85°C
   - Likely cause: Friction from belt misalignment or insufficient lubrication
   
2. **Motor Vibration Critical** (7.8 mm/s)
   - Exceeded threshold of 7 mm/s
   - Indicates potential bearing wear or motor imbalance

**Recommended Actions:**
- Immediately reduce compressor load by 30%
- Check belt tension and alignment
- Inspect motor bearings
- Schedule emergency maintenance within 24 hours

**Risk Assessment:** High probability of compressor failure within 48 hours if not addressed.`,
    };
  }

  if (lowerMessage.includes("predict") || lowerMessage.includes("failure") || lowerMessage.includes("next")) {
    return {
      reasoning: "Running predictive models on all machine sensor data... Analyzing historical patterns and anomaly trends.",
      content: `**Failure Prediction Analysis**

Based on current sensor data and historical patterns:

| Machine | Risk Level | Est. Time to Failure |
|---------|------------|---------------------|
| Air Compressor Delta | Critical | 24-48 hours |
| Water Pump Beta | Medium | 7-14 days |
| CNC Mill Alpha | Low | 45+ days |

**Priority Actions:**
1. **Air Compressor Delta** - Immediate intervention required
2. **Water Pump Beta** - Schedule maintenance within 1 week
3. Continue monitoring other machines

The AI system will continue monitoring and will alert you of any changes.`,
    };
  }

  if (lowerMessage.includes("health") || lowerMessage.includes("summary") || lowerMessage.includes("status")) {
    return {
      reasoning: "Aggregating data from 24 machines... Calculating system health metrics and identifying anomalies.",
      content: `**System Health Summary**

**Overall Score: 92%** (Good)

**Machine Status Overview:**
- Operational: 21 machines
- Warning: 1 machine (Water Pump Beta)
- Critical: 2 machines (Air Compressor Delta)

**Key Metrics:**
- Production Efficiency: 87.5%
- Average Uptime: 95.2%
- Energy Consumption: 1,245.8 kWh (today)

**Active Concerns:**
1. Air Compressor Delta requires immediate attention
2. 3 pending maintenance tasks this week
3. Energy consumption 3.1% above target

**Positive Trends:**
- OEE improved 2.5% this week
- No new security incidents
- AI predictions 94% accurate this month`,
    };
  }

  if (lowerMessage.includes("maintenance") || lowerMessage.includes("due")) {
    return {
      reasoning: "Querying maintenance schedule database... Cross-referencing with AI predictions.",
      content: `**Upcoming Maintenance Schedule**

**Overdue:**
- Air Compressor Delta - Was due 2026-02-10

**This Week:**
- Water Pump Beta - Due 2026-04-01 (3 days)
- CNC Mill Alpha - Due 2026-04-15

**This Month:**
- CNC Lathe Epsilon - Due 2026-05-25
- Assembly Robot Gamma - Due 2026-05-20
- Coolant Pump Zeta - Due 2026-06-01

**AI Recommendations:**
- Prioritize Air Compressor Delta emergency repair
- Consider bundling Beta and Alpha maintenance
- Order replacement parts for Delta (belt, bearings)`,
    };
  }

  return {
    reasoning: "Processing query... Searching knowledge base and analyzing current system state.",
    content: `I understand you're asking about "${message}". 

I can help you with:
- **Machine diagnostics** - "Why is [machine] failing?"
- **Predictions** - "Predict next failure"
- **System overview** - "Summarize system health"
- **Maintenance** - "What maintenance is due?"
- **Specific machines** - Ask about any machine by name or ID

How can I assist you with your industrial monitoring needs?`,
  };
};

const initialChats: Chat[] = [
  {
    id: "1",
    title: "Compressor Analysis",
    lastMessage: "The machine is experiencing two critical issues...",
    timestamp: new Date(BASE_CHAT_TIME.getTime() - 1000 * 60 * 30),
    messages: [
      {
        id: "1-1",
        role: "user",
        content: "Why is Air Compressor Delta failing?",
        timestamp: new Date(BASE_CHAT_TIME.getTime() - 1000 * 60 * 35),
      },
      {
        id: "1-2",
        role: "assistant",
        content: `**Analysis: Air Compressor Delta (MCH-004)**

The machine is experiencing two critical issues:
        timestamp: new Date(BASE_CHAT_TIME.getTime() - 1000 * 60 * 34),
1. **Belt Temperature Critical** (92°C)
   - Exceeded critical threshold of 85°C
   
2. **Motor Vibration Critical** (7.8 mm/s)
   - Exceeded threshold of 7 mm/s`,
        reasoning: "Analyzing sensor data...",
        timestamp: new Date(Date.now() - 1000 * 60 * 34),
      },
    ],
  },
  {
    id: "2",
    title: "Maintenance Schedule",
    lastMessage: "Upcoming maintenance tasks...",
    timestamp: new Date(BASE_CHAT_TIME.getTime() - 1000 * 60 * 60 * 2),
    messages: [
      {
        id: "2-1",
        role: "user",
        content: "What maintenance is due?",
        timestamp: new Date(BASE_CHAT_TIME.getTime() - 1000 * 60 * 60 * 2),
      },
    ],
  },
  {
    id: "3",
    title: "System Health Check",
    lastMessage: "Overall system health is at 92%",
    timestamp: new Date(BASE_CHAT_TIME.getTime() - 1000 * 60 * 60 * 24),
    messages: [],
  },
];

export default function AssistantPage() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredChats = chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewChat = () => {
    setActiveChat(null);
    setMessages([]);
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      setMessages(chat.messages);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = generateResponse(input);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response.content,
      reasoning: response.reasoning,
      timestamp: new Date(),
    };

    const updatedMessages = [...newMessages, assistantMessage];
    setMessages(updatedMessages);
    setIsTyping(false);

    // Update or create chat
    if (activeChat) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChat
            ? { ...c, messages: updatedMessages, lastMessage: response.content.slice(0, 50) + "..." }
            : c
        )
      );
    } else {
      const newChat: Chat = {
        id: Date.now().toString(),
        title: input.slice(0, 30) + (input.length > 30 ? "..." : ""),
        lastMessage: response.content.slice(0, 50) + "...",
        timestamp: new Date(),
        messages: updatedMessages,
      };
      setChats((prev) => [newChat, ...prev]);
      setActiveChat(newChat.id);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="route-accent-assistant flex h-[calc(100vh-6rem)] overflow-hidden rounded-xl border border-border bg-card">
      {/* Chat History Sidebar */}
      <div
        className={cn(
          "flex-shrink-0 border-r border-border bg-muted/30 transition-all duration-200",
          showSidebar ? "w-72 lg:w-80" : "w-0 overflow-hidden"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="font-semibold text-foreground">Chat History</h2>
            <Button size="sm" onClick={handleNewChat} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1 pb-4">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group relative flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors",
                    activeChat === chat.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{chat.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {chat.lastMessage}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(chat.timestamp)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">IntelliViz Assistant</h1>
            <p className="text-xs text-muted-foreground">
              Industrial Intelligence Platform
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 lg:p-6" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">
                How can I help you today?
              </h2>
              <p className="mb-8 max-w-md text-sm text-muted-foreground">
                I can analyze machine health, predict failures, provide maintenance
                recommendations, and answer questions about your industrial systems.
              </p>
              <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q.text)}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <q.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{q.text}</p>
                      <p className="text-xs text-muted-foreground">{q.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.reasoning && (
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Sparkles className="h-3 w-3" />
                        <span className="italic">{message.reasoning}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "prose prose-sm max-w-none",
                        message.role === "user"
                          ? "text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground"
                          : "text-foreground prose-headings:text-foreground prose-strong:text-foreground"
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
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex gap-1.5 rounded-2xl bg-muted px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.3s]" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 lg:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="mx-auto flex max-w-3xl gap-3"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about machine health, predictions, maintenance..."
              className="flex-1 rounded-xl"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isTyping}
              className="h-10 w-10 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
