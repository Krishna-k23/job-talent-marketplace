import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, LogIn, UserPlus, HelpCircle, Phone, FileText, Users, Briefcase, DollarSign, Settings, Headphones } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

interface ChatbotProps {
  isLoggedIn?: boolean;
}

export function Chatbot({ isLoggedIn = false }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: isLoggedIn
        ? 'Hello! How can I assist you with your portal today?'
        : 'Hello! How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Quick Actions for NOT logged in users
  const guestQuickActions = [
    {
      id: 'signin',
      label: 'Sign In',
      icon: LogIn,
      message: 'I need help signing in',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'signup',
      label: 'Sign Up',
      icon: UserPlus,
      message: 'I want to sign up for an account',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'help',
      label: 'Help',
      icon: HelpCircle,
      message: 'I need quick assistance',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Phone,
      message: 'I want to connect with support',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  // Quick Actions for logged in users
  const userQuickActions = [
    {
      id: 'requirements',
      label: 'Requirements',
      icon: FileText,
      message: 'I need help with requirements',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: Users,
      message: 'I have questions about resources',
      color: 'from-green-500 to-green-600',
    },
    {
      id: 'contracts',
      label: 'Contracts',
      icon: Briefcase,
      message: 'I need assistance with contracts',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: DollarSign,
      message: 'I have a billing question',
      color: 'from-orange-500 to-orange-600',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      message: 'Help me with account settings',
      color: 'from-pink-500 to-pink-600',
    },
    {
      id: 'support',
      label: 'Support',
      icon: Headphones,
      message: 'I need technical support',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  const quickActions = isLoggedIn ? userQuickActions : guestQuickActions;

  const handleQuickAction = (action: typeof quickActions[0]) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: action.message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setShowQuickActions(false);
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(action.id),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (actionId: string): string => {
    const guestResponses: Record<string, string> = {
      signup: "Great! To sign up, click the 'Sign Up' button on the top right of the homepage. You'll need to provide your email and create a password.",
      signin: "To sign in, click the 'Sign In' button on the homepage. If you've forgotten your password, use the 'Forgot Password' link.",
      help: 'I can help you with account setup, navigation, posting requirements, or finding resources. What do you need help with?',
      contact: 'You can reach our support team at support@benchbridge.com or call us at +91-80-1234-5678 during business hours (9 AM - 6 PM IST).',
    };

    const userResponses: Record<string, string> = {
      requirements: "I can help you with posting requirements, editing existing ones, viewing matches, or managing your job requirements. Navigate to the Requirements section from the sidebar.",
      resources: "For resources, you can search available talent, view profiles, check availability, and manage resource allocations. Visit the Resources section for more details.",
      contracts: "Need help with contracts? You can view active contracts, check contract details, monitor duration and billing, or download contract documents from the Contracts page.",
      billing: "For billing inquiries, you can view your current plan, check payment history, update payment methods, or download invoices from the Billing section.",
      settings: "In Settings, you can update your profile information, change password, manage notification preferences, or configure account settings.",
      support: "Our technical support team is here to help! You can reach us at support@benchbridge.com or call +91-80-1234-5678 (9 AM - 6 PM IST). We typically respond within 2-4 hours.",
    };

    const responses = isLoggedIn ? userResponses : guestResponses;
    return responses[actionId] || "I'm here to help! Please let me know what you need assistance with.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: isLoggedIn 
          ? "Thank you for your message! Our team will assist you shortly. For immediate help, please check our FAQ section or contact support."
          : "Thank you for your message! Please log in to continue the conversation. You can sign in using the 'Sign In' button on the top right.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full shadow-2xl shadow-blue-600/40 hover:shadow-blue-700/50 hover:scale-110 transition-all duration-300 z-40 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <MessageCircle size={24} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
            1
          </span>
        </button>
      )}

      {/* Chat Window - Responsive Design */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in zoom-in-95 fade-in duration-300">
          <div 
            ref={chatContainerRef}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
            style={{
              width: 'min(90vw, 400px)',
              height: 'min(80vh, 600px)',
              maxWidth: '400px',
              minWidth: '280px',
              maxHeight: '600px',
              minHeight: '450px',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-600 to-cyan-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Chat Assistant</h3>
                  <p className="text-xs text-blue-100">How can I help you?</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'bot'
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                        : 'bg-gradient-to-br from-purple-600 to-pink-600'
                    }`}
                  >
                    {message.sender === 'bot' ? (
                      <Bot size={18} className="text-white" />
                    ) : (
                      <User size={18} className="text-white" />
                    )}
                  </div>
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                      message.sender === 'bot'
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'bot' ? 'text-slate-400' : 'text-blue-100'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-600 to-cyan-600">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              {showQuickActions && (
                <div className={`grid ${isLoggedIn ? 'grid-cols-3' : 'grid-cols-2'} gap-3 pt-4`}>
                  {quickActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className={`p-4 bg-gradient-to-br ${action.color} text-white rounded-xl hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95`}
                    >
                      <action.icon size={isLoggedIn ? 20 : 24} className="mx-auto mb-2" />
                      <p className={`${isLoggedIn ? 'text-xs' : 'text-sm'} font-semibold`}>{action.label}</p>
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="w-11 h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg disabled:shadow-none disabled:cursor-not-allowed active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}