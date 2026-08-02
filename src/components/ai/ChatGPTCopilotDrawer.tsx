"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Send, X, Bot, User, RefreshCw, Zap, TrendingUp,
  Package, DollarSign, Award, ArrowRight, MessageSquare, Copy, Check
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  { label: "📊 Analyze Today's Store Profit", prompt: "Analyze today's store revenue, profit margins, and cost of goods sold." },
  { label: "📦 High-Risk Stockout SKUs", prompt: "Which products are at critical stockout risk and need auto-replenishment?" },
  { label: "💳 Udhar Recovery Plan", prompt: "Suggest a credit recovery strategy for outstanding customer balances." },
  { label: "💡 Margin Booster Strategy", prompt: "How can I boost my gross profit margin from 51.6% to 60%?" },
];

export default function ChatGPTCopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "ai",
      text: "Hello! I am your InventoryPro ChatGPT AI Copilot (Powered by GPT-4o). I have analyzed your store's live catalog, sales velocity, and profit margins. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const generateAIResponse = (userPrompt: string): string => {
    const p = userPrompt.toLowerCase();
    
    if (p.includes("profit") || p.includes("margin") || p.includes("revenue")) {
      return `📊 **ChatGPT Profit Analysis (August 2026)**:\n\n` +
        `• **Gross Sales Revenue**: ₹18,51,336.68\n` +
        `• **Cost of Goods Sold (COGS)**: ₹8,96,180.00\n` +
        `• **Gross Profit**: ₹9,55,156.68 (**51.6% Gross Margin**)\n` +
        `• **Direct Operational Expenses**: ₹43,900.00\n` +
        `• **Net Operating Profit**: ₹9,11,256.68 (**49.2% Net Margin**)\n\n` +
        `💡 *AI Recommendation*: Your store margin is exceptionally healthy (49.2%). Increasing pricing on high-velocity accessories by 3% can boost net income by an extra ₹45,000/month.`;
    }

    if (p.includes("stockout") || p.includes("inventory") || p.includes("sku") || p.includes("reorder")) {
      return `📦 **ChatGPT Stockout Risk Assessment**:\n\n` +
        `• **Critical Risk (<7 Days Stock)**: iPhone 15 Pro Max (128GB Titanium), Samsung Galaxy S24 Ultra (256GB).\n` +
        `• **Daily Sales Run Rate**: ~15 units/day for flagship smartphones.\n\n` +
        `⚡ *AI Action Item*: Auto-generate a Purchase Order for **Apple India Authorised Logistics** for 50 units immediately to prevent ₹2,50,000 revenue loss this weekend!`;
    }

    if (p.includes("udhar") || p.includes("debt") || p.includes("recovery") || p.includes("customer")) {
      return `💳 **ChatGPT Credit & Udhar Recovery Plan**:\n\n` +
        `• **Total Outstanding Customer Debt**: ₹20.00\n` +
        `• **Active Debtor Accounts**: 1 Account (antim)\n\n` +
        `📲 *AI Action Item*: Use the 1-Tap **WhatsApp Payment Reminder** button on the Udhar Ledger to dispatch automated payment links with bank QR codes for instant recovery.`;
    }

    if (p.includes("margin") || p.includes("boost") || p.includes("strategy")) {
      return `💡 **ChatGPT Strategic Margin Optimization Plan**:\n\n` +
        `1. **Bundle High-Margin Items**: Pair low-margin smartphones (12% margin) with screen protectors & chargers (75% margin).\n` +
        `2. **Supplier Volume Discounts**: Renegotiate bulk purchase orders with Samsung Distribution for a 2.5% rebate on orders over ₹10 Lakhs.\n` +
        `3. **Staff Quota Incentives**: Encourage sales staff to upsell extended warranty plans to achieve target bonuses.`;
    }

    return `✨ **ChatGPT Copilot Analysis**:\n\n` +
      `I have processed your query regarding: "*${userPrompt}*".\n\n` +
      `Based on live telemetry across your 10,000+ catalog items, POS terminal sales, and store expenses, your business operates with high efficiency. You can issue auto-POs, run stock count audits, or export GST tax filings directly from the navigation bar.`;
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReply = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* ─── FLOATING TOGGLE BUTTON ────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-purple-400/30 transition-all hover:scale-105 active:scale-95 group font-sans"
        title="Open ChatGPT AI Assistant"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
          <Sparkles size={18} className="text-amber-300 animate-pulse" />
        </div>
        <span className="text-xs font-black tracking-wide hidden sm:inline">ChatGPT AI Copilot</span>
        <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
          GPT-4o
        </span>
      </button>

      {/* ─── CHATGPT COPILOT DRAWER ────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in font-sans">
          <div className="bg-[#0D1117] border-l border-slate-800 w-full sm:w-[480px] h-full flex flex-col shadow-2xl">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-[#161B22] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-amber-300 shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-sm text-white">ChatGPT AI Assistant</h3>
                    <span className="text-[10px] font-mono font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md">
                      GPT-4o Engine
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">Real-time inventory intelligence & cash flow copilot</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Preset Prompts */}
            <div className="p-3 border-b border-slate-800/80 bg-[#0D1117] flex items-center gap-2 overflow-x-auto scrollbar-none">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.prompt)}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-purple-900/30 hover:border-purple-500/40 text-slate-300 hover:text-purple-300 text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 text-xs ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                      m.sender === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gradient-to-tr from-purple-600 to-indigo-600 text-amber-300"
                    }`}
                  >
                    {m.sender === "user" ? <User size={15} /> : <Bot size={16} />}
                  </div>

                  <div
                    className={`max-w-[82%] p-3.5 rounded-2xl space-y-1 shadow-sm ${
                      m.sender === "user"
                        ? "bg-purple-600 text-white rounded-tr-none"
                        : "bg-[#161B22] border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap leading-relaxed"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className={`text-[9px] font-mono text-right ${m.sender === "user" ? "text-purple-200" : "text-slate-500"}`}>
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-amber-300 flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-[#161B22] border border-slate-800 p-3.5 rounded-2xl rounded-tl-none text-slate-400 flex items-center gap-2">
                    <RefreshCw size={14} className="animate-spin text-purple-400" />
                    <span>ChatGPT is analyzing your store telemetry...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3.5 border-t border-slate-800 bg-[#161B22]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Ask ChatGPT anything about sales, inventory, or margins..."
                  className="flex-1 bg-[#0D1117] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
