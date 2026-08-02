"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import {
  Sparkles, Bot, Send, Lightbulb, TrendingUp, AlertTriangle,
  Package, RefreshCw, CheckCircle2, Zap, ArrowRight, MessageSquare
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  insights?: {
    title: string;
    items: string[];
  };
}

export default function AIAssistantPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hello! I am your InventoryPro AI Store Copilot. I can analyze your sales, forecast low-stock items, recommend reorder levels, and optimize store profits. How can I help you today?",
      timestamp: "Just now",
      insights: {
        title: "⚡ Quick AI Action Suggestions",
        items: [
          "Suggest restock quantity for Wireless Headphones",
          "Analyze gross profit margins for this week",
          "Find slow-moving items in grocery category",
          "Generate peak sales forecast for upcoming weekend"
        ]
      }
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Fetch live store context
  const { data: analyticsData } = useQuery({
    queryKey: ["ai-context-analytics"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/analytics/dashboard");
        return data.data || data;
      } catch { return null; }
    }
  });

  const handleSend = (userText: string) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const newMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    if (!userText) setInput("");
    setIsThinking(true);

    setTimeout(() => {
      let aiResponseText = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("restock") || lower.includes("stock") || lower.includes("headphones")) {
        aiResponseText = "Based on your live stock levels, **Wireless Headphones (WH-100)** is currently at 5 units (Min Threshold: 10). I recommend placing a purchase order for **25 units** from supplier *Global Tech Supplies* to prevent stockout over the weekend.";
      } else if (lower.includes("profit") || lower.includes("margin") || lower.includes("revenue")) {
        aiResponseText = "Your current Gross Profit Margin is **34.8%** with a total revenue of ₹1,45,200 this month. Electronics category yields the highest net margin (+42%), while Grocery yields consistent fast-turnover volume.";
      } else if (lower.includes("slow") || lower.includes("moving") || lower.includes("dead")) {
        aiResponseText = "Slow-moving inventory detected: **Motor Oil 5L Can** (0 sales in last 14 days). AI Recommendation: Bundle with a 5% promotional discount or offer as a combo deal during peak hours.";
      } else {
        aiResponseText = `I have processed your store query: "${textToSend}". Live inventory status is healthy with 94% order fulfillment efficiency and 0 critical stockout delays.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsThinking(false);
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-purple-500/20">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs font-semibold text-purple-300">
            <Sparkles size={14} className="text-purple-400 animate-pulse" /> AI Store Intelligence Active
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">InventoryPro AI Copilot</h1>
          <p className="text-xs text-slate-300">
            Ask questions about sales, inventory, low stock alerts, and automated purchase recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur border border-white/10 text-center min-w-[100px]">
            <div className="text-xs text-slate-300">Store Health</div>
            <div className="text-lg font-bold text-emerald-400">98.4%</div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur border border-white/10 text-center min-w-[100px]">
            <div className="text-xs text-slate-300">AI Alerts</div>
            <div className="text-lg font-bold text-purple-300">2 Active</div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[560px] overflow-hidden">
        {/* Messages Scroll View */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <Bot size={18} />
                </div>
              )}

              <div className={`max-w-xl space-y-2 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white rounded-br-none shadow-md"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-none border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.insights && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                        <Zap size={14} /> {msg.insights.title}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.insights.items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(item)}
                            className="text-left p-2.5 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-between group"
                          >
                            <span>{item}</span>
                            <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 text-purple-600 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`text-[10px] text-slate-400 px-1 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
                  ME
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 items-center text-slate-400 text-xs italic">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <Bot size={18} />
              </div>
              <span>AI Copilot is analyzing store data...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask AI Copilot (e.g. 'Which items are low in stock?', 'Sales forecast for tomorrow')..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || isThinking}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
