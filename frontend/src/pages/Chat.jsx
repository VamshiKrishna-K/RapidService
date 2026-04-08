import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send, Phone, Video, MoreVertical, Search, MessageSquare } from "lucide-react";

const mockChats = [
  {
    id: 1,
    name: "Anita Sharma",
    avatar: "https://i.pravatar.cc/150?u=anita",
    lastMessage: "I'll be there at 10 AM sharp.",
    timestamp: "10:30 AM",
    unread: 1,
    messages: [
      { id: 1, senderId: 1, text: "Hi, I've confirmed your booking for tomorrow.", timestamp: "10:25 AM", isOwn: false },
      { id: 2, senderId: "user", text: "Great, see you then!", timestamp: "10:28 AM", isOwn: true },
      { id: 3, senderId: 1, text: "I'll be there at 10 AM sharp.", timestamp: "10:30 AM", isOwn: false }
    ]
  },
  {
    id: 2,
    name: "Rahul Kumar",
    avatar: "https://i.pravatar.cc/150?u=rahul",
    lastMessage: "The wiring issue is fixed.",
    timestamp: "Yesterday",
    unread: 0,
    messages: [
      { id: 1, senderId: 2, text: "The wiring issue is fixed.", timestamp: "Yesterday", isOwn: false }
    ]
  }
];

const Chat = () => {
  const [activeChat, setActiveChat] = useState(mockChats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(mockChats[0]?.messages || []);
  const [showSidebar, setShowSidebar] = useState(true);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = {
      id: Date.now(),
      senderId: "user",
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  const selectChat = (chat) => {
    setActiveChat(chat);
    setMessages(chat.messages);
    setShowSidebar(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shrink-0 shadow-lg">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-black uppercase tracking-widest">Global Messenger</h1>
              <p className="text-[8px] font-black text-primary-foreground/60 uppercase tracking-[0.2em]">End-to-end encrypted</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat List */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border bg-card flex flex-col ${showSidebar ? "block" : "hidden md:flex"}`}>
          <div className="p-6">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full pl-11 pr-4 py-3 bg-muted/50 border-2 border-border rounded-2xl text-xs font-bold outline-none focus:border-primary transition-all" 
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {mockChats.map((chat) => (
              <button 
                key={chat.id} 
                onClick={() => selectChat(chat)} 
                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${activeChat?.id === chat.id ? "bg-primary/5 shadow-inner" : "hover:bg-muted/50"}`}
              >
                <div className="relative">
                  <img src={chat.avatar} alt={chat.name} className="w-14 h-14 rounded-full border-2 border-border" />
                  {chat.unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-background">
                      {chat.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-black text-foreground text-sm uppercase tracking-tight truncate">{chat.name}</h3>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest shrink-0">{chat.timestamp}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate">{chat.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-muted/30 ${!showSidebar ? "flex" : "hidden md:flex"}`}>
          {activeChat ? (
            <>
              <div className="px-6 py-4 bg-card border-b border-border flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 text-muted-foreground">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="relative">
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-sm uppercase tracking-tight">{activeChat.name}</h3>
                    <p className="text-[10px] text-primary font-black uppercase tracking-widest">Active Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-all"><Phone className="w-5 h-5" /></button>
                  <button className="p-2.5 text-muted-foreground hover:bg-muted rounded-xl transition-all"><Video className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                 {messages.map((msg) => (
                   <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"} animate-fade-in`}>
                     <div className={`max-w-[70%] group relative px-6 py-4 rounded-[2rem] shadow-sm ${msg.isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card border border-border rounded-bl-none text-foreground"}`}>
                        <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                        <span className={`text-[8px] font-black uppercase tracking-widest mt-2 block ${msg.isOwn ? "text-primary-foreground/50" : "text-muted-foreground/50"}`}>
                          {msg.timestamp}
                        </span>
                     </div>
                   </div>
                 ))}
              </div>

              {/* Message Input */}
              <div className="p-6 bg-card border-t border-border">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a premium message..."
                    className="flex-1 px-6 py-4 bg-muted/50 border-2 border-border rounded-3xl text-sm font-bold outline-none focus:border-primary transition-all"
                  />
                  <button 
                    onClick={handleSend} 
                    disabled={!newMessage.trim()} 
                    className="bg-primary text-primary-foreground p-4 rounded-3xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
               <div className="w-24 h-24 bg-primary/10 rounded-[3rem] flex items-center justify-center mb-6">
                  <MessageSquare className="w-12 h-12 text-primary" />
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Select a Conversation</h3>
               <p className="text-muted-foreground text-sm max-w-xs font-medium">Choose a professional from the list to start discussing your project.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

