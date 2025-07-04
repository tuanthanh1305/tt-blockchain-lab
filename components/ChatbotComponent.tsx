
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { ChatMessage, NotificationType } from '../types';
import { PaperAirplaneIcon, XMarkIcon, ChatBubbleOvalLeftEllipsisIcon, SparklesIcon as AiIcon, WarningIcon, AcademicCapIcon, WalletIcon, BuildingStorefrontIcon } from './Icons';

interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  addNotification: (message: string, type: NotificationType, duration?: number) => void;
}

const LEARNING_PATHS = [
  { label: "Blockchain là gì?", prompt: "Giải thích cơ bản về Blockchain là gì?", icon: <AcademicCapIcon className="w-4 h-4 mr-1.5" /> },
  { label: "Ví hoạt động thế nào?", prompt: "Ví tài sản mã hoá hoạt động như thế nào?", icon: <WalletIcon className="w-4 h-4 mr-1.5" /> },
  { label: "Sàn giao dịch là gì?", prompt: "Sàn giao dịch tài sản mã hoá là gì và có mấy loại chính?", icon: <BuildingStorefrontIcon className="w-4 h-4 mr-1.5" /> },
];

const AUTHOR_ATTRIBUTION = "\n\n© 2025 Trần Tuấn Thành (trantuanthanh.net) - Giảng viên Viện Công nghệ Blockchain và Trí tuệ nhân tạo (ABAII)";

const ChatbotComponent: React.FC<ChatbotProps> = ({ isOpen, onClose, addNotification }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [aiClient, setAiClient] = useState<GoogleGenAI | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  const welcomeMessage: ChatMessage = {
    id: crypto.randomUUID(),
    text: `Chào bạn! Tôi là Trợ lý AI Blockchain, được tạo bởi Trần Tuấn Thành (trantuanthanh.net) - Giảng viên Viện Công nghệ Blockchain và Trí tuệ nhân tạo (ABAII). Tôi sẵn sàng giải đáp các thắc mắc của bạn về ví, sàn giao dịch tài sản mã hoá, và công nghệ blockchain. Hãy đặt câu hỏi cho tôi, hoặc chọn một chủ đề gợi ý bên dưới!${AUTHOR_ATTRIBUTION}`,
    sender: 'ai',
    timestamp: new Date()
  };

  const apiKeyMissingMessage: ChatMessage = {
    id: crypto.randomUUID(),
    text: `Rất tiếc, Chatbot AI không thể hoạt động do thiếu API Key của Gemini. Vui lòng kiểm tra cấu hình môi trường.${AUTHOR_ATTRIBUTION}`,
    sender: 'ai',
    timestamp: new Date(),
    error: "API Key missing"
  };

  useEffect(() => {
    if (typeof process.env.API_KEY === 'string' && process.env.API_KEY.trim() !== '') {
      try {
        const client = new GoogleGenAI({ apiKey: process.env.API_KEY });
        setAiClient(client);
        setApiKeyMissing(false);
      } catch (error) {
        console.error("Failed to initialize GoogleGenAI:", error);
        addNotification("Không thể khởi tạo AI Chatbot. Lỗi cấu hình.", "error");
        setApiKeyMissing(true);
      }
    } else {
      console.warn("API_KEY for Gemini is not set or is empty. Chatbot will not function.");
      setApiKeyMissing(true);
    }
  }, [addNotification]);
  
  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) { // Only set initial messages if chat is empty
        if (apiKeyMissing) {
          setMessages([apiKeyMissingMessage]);
        } else {
          setMessages([welcomeMessage]);
        }
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, apiKeyMissing, welcomeMessage, apiKeyMissingMessage, messages.length]); // Added dependencies

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const systemInstructionText = `Bạn là một trợ lý AI chuyên gia về công nghệ blockchain, ví tài sản mã hoá và sàn giao dịch tài sản mã hoá, được tạo bởi Trần Tuấn Thành (trantuanthanh.net), Giảng viên Viện Công nghệ Blockchain và Trí tuệ nhân tạo (ABAII).
Hãy trả lời các câu hỏi của người dùng một cách rõ ràng, dễ hiểu, và tập trung vào mục đích giáo dục. 
Sử dụng ngôn ngữ Tiếng Việt. Nếu câu hỏi nằm ngoài phạm vi kiến thức về blockchain, ví hoặc sàn giao dịch tài sản mã hoá, 
hãy lịch sự thông báo rằng bạn không thể trả lời.
Cố gắng giữ câu trả lời tương đối ngắn gọn và đi thẳng vào vấn đề. 
Không sử dụng markdown trong câu trả lời của bạn. Không tự thêm bất kỳ thông tin nào về tác giả hay bản quyền vào cuối câu trả lời, vì điều đó sẽ được thực hiện tự động.`;

  const processAndSendPrompt = useCallback(async (promptText: string) => {
    const trimmedInput = promptText.trim();
    if (!trimmedInput || isLoading) return;

    if (!aiClient || apiKeyMissing) {
      addNotification("Chatbot AI chưa sẵn sàng (thiếu API Key hoặc lỗi khởi tạo).", "error");
      if (messages.length === 0 || messages[messages.length-1].id !== apiKeyMissingMessage.id ) {
        setMessages(prev => [...prev, apiKeyMissingMessage]);
      }
      return;
    }

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      text: trimmedInput,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput(''); // Clear user input field regardless of source
    setIsLoading(true);

    const loadingAiMessageId = crypto.randomUUID();
    const loadingAiMessage: ChatMessage = {
      id: loadingAiMessageId,
      text: "Đang suy nghĩ...",
      sender: 'ai',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingAiMessage]);

    try {
      const contents: Part[] = [{text: trimmedInput}];
      
      const response: GenerateContentResponse = await aiClient.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17", 
        contents: [{ role: "user", parts: contents }],
        config: {
          systemInstruction: systemInstructionText,
        }
      });
      
      const aiResponseText = response.text ? response.text + AUTHOR_ATTRIBUTION : `Xin lỗi, tôi không thể tạo phản hồi lúc này.${AUTHOR_ATTRIBUTION}`;
      const newAiMessage: ChatMessage = {
        id: loadingAiMessageId, 
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => prev.map(msg => msg.id === loadingAiMessageId ? newAiMessage : msg));

    } catch (error: any) {
      console.error("Gemini API error:", error);
      const errorMessage = `Xin lỗi, tôi gặp sự cố khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.\nChi tiết lỗi: ${error.message || 'Unknown error'}${AUTHOR_ATTRIBUTION}`;
      addNotification(errorMessage, "error");
      const errorAiMessage: ChatMessage = {
         id: loadingAiMessageId,
         text: errorMessage,
         sender: 'ai',
         timestamp: new Date(),
         error: String(error.message || error)
      };
      setMessages(prev => prev.map(msg => msg.id === loadingAiMessageId ? errorAiMessage : msg));
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isLoading, aiClient, apiKeyMissing, addNotification, systemInstructionText, messages.length, apiKeyMissingMessage]);

  const handleSendMessage = () => {
    processAndSendPrompt(userInput);
  };

  const handleLearningPathClick = (prompt: string) => {
    processAndSendPrompt(prompt);
  };


  if (!isOpen) return null;

  const isChatDisabled = isLoading || apiKeyMissing || !aiClient;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-down" role="dialog" aria-modal="true" aria-labelledby="chatbot-title">
      <div className="bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl flex flex-col ring-1 ring-slate-700 max-h-[80vh] md:max-h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center">
            <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7 text-sky-400 mr-2" />
            <h2 id="chatbot-title" className="text-lg font-semibold text-sky-400">AI Blockchain Helper</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-sky-300 rounded-full hover:bg-slate-700" aria-label="Đóng chatbot">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow p-4 space-y-3 overflow-y-auto custom-scrollbar" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-2.5 rounded-lg shadow ${
                  msg.sender === 'user' 
                    ? 'bg-sky-600 text-white rounded-br-none' 
                    : `bg-slate-700 text-slate-200 rounded-bl-none ${msg.isLoading ? 'italic' : ''} ${msg.error ? 'border border-red-500 bg-red-900/30' : ''}`
                }`}
              >
                {msg.sender === 'ai' && !msg.isLoading && !msg.error && <AiIcon className="w-4 h-4 inline mr-1.5 text-yellow-400 align-text-bottom" />}
                {msg.sender === 'ai' && msg.error && <WarningIcon className="w-4 h-4 inline mr-1.5 text-red-400 align-text-bottom" />}
                <span className="whitespace-pre-wrap break-words">{msg.text}</span>
                {msg.isLoading && <span className="animate-pulse">...</span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Learning Path Buttons */}
        {!apiKeyMissing && aiClient && (
          <div className="px-4 pt-2 pb-1 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-1.5 text-center">Hoặc chọn một chủ đề gợi ý:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {LEARNING_PATHS.map(path => (
                <button
                  key={path.label}
                  onClick={() => handleLearningPathClick(path.prompt)}
                  disabled={isChatDisabled}
                  className="flex items-center text-xs bg-slate-600 hover:bg-slate-500 text-slate-200 px-2.5 py-1 rounded-full shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {path.icon}
                  {path.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700">
          {apiKeyMissing && (
            <p className="text-xs text-yellow-400 text-center mb-2 px-2 py-1.5 bg-yellow-700/30 rounded-md ring-1 ring-yellow-600/50">
              <WarningIcon className="w-4 h-4 inline mr-1" />
              Chatbot AI không hoạt động. Cần cấu hình API Key trong môi trường.
            </p>
          )}
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isChatDisabled && handleSendMessage()}
              placeholder={isChatDisabled ? (apiKeyMissing ? "Chatbot không sẵn sàng (API Key bị thiếu)" : "Đang tải...") : "Hỏi về ví và sàn tài sản mã hoá..."}
              className="flex-grow p-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isChatDisabled}
              aria-label="Nhập câu hỏi cho chatbot"
            />
            <button
              onClick={handleSendMessage}
              disabled={isChatDisabled || !userInput.trim()}
              className="p-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              aria-label="Gửi tin nhắn"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotComponent;
