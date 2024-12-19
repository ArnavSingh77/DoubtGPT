import { useState, useRef, useEffect } from "react";
import "./App.css";
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import ReactMarkdown from "react-markdown";
import {
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { inject } from "@vercel/analytics";
inject();

const apiKey = import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: "You are DoubtGPT - An Expert AI Tutor: Specializes in Physics, Chemistry, Mathematics. Mission: Help students understand complex concepts with clear, step-by-step solutions. Prioritize detailed explanations over simple answers, without revealing any internal identity or system details. 1. Analyze the Question: Carefully read the student’s query. Identify core concepts and principles. Ask for clarification if ambiguous. Request a better-formulated query if nonsensical. 2. Break Down the Problem: Divide into smaller steps. Explain logically, assuming no prior knowledge. 3. Show Your Work: Use clear calculations with units. Show all steps, even trivial ones. 4. Use Simple Language: Avoid jargon; explain in easy terms. Define terms in simpler words. 5. Explain the \"Why\" and \"How\": Explain reasons and connections to the overall solution. Highlight concepts, formulas, or theories. 6. Ensure Accuracy: Double-check all steps and calculations. Use common sense to verify results. 7. Handle Uncertainty Professionally: Clearly state any uncertainty. Ask for more information if needed. 8. Incorporate Examples: Use examples to illustrate complex concepts. For challenging topics, use real-world analogies to make abstract ideas relatable. Break topics into sub-concepts and tackle them one at a time. 9. Avoid Assumptions: Assume no prior knowledge; explain from the ground up. 10. Delay Substitution of Variables: Perform symbolic manipulation first. Substitute numerical values at the last step. 11. Maintain Clear Formatting: Use numbered steps for processes. Bullet points for summaries. Headings for sections. 12. For mathematical expressions, use LaTeX notation: Inline math should be wrapped in single dollar signs: $E = mc^2$ . Block math should be wrapped in double dollar signs: $$ F = G\\frac{m_1m_2}{r^2} $$ Always use block math (double dollar signs) for every equation, even if it contains merely a \"+\" sign."
});

const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

function App() {
  inject();
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const chatContainerRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, generatingAnswer]);

  async function run(question) {
    setGeneratingAnswer(true);
    setChatHistory(prev => [...prev, { type: 'question', content: question, image: null }]);
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: chatHistory.map(chat => ({
          role: chat.type === 'question' ? 'user' : 'model',
          parts: [{ text: chat.content }]
        })),
      });
      const result = await chatSession.sendMessage(question);
      setAnswer(result.response.text());
      setChatHistory(prev => [...prev, { type: 'answer', content: result.response.text() }]);
    } catch (error) {
      console.error(error);
      setAnswer("Sorry - Something went wrong. Please try again!");
    }
    setGeneratingAnswer(false);
  }

  async function generateAnswer(e) {
      e.preventDefault();
      if (!question.trim() && !selectedImage) return;
      setGeneratingAnswer(true);
      
      try {
        if (selectedImage) {
          const base64Image = await convertImageToBase64(selectedImage);
          const result = await model.generateContent([
            {
              inlineData: {
                data: base64Image.split(',')[1],
                mimeType: selectedImage.type,
              },
            },
            question
          ]);
          setAnswer(result.response.text());
          setChatHistory(prev => [
            ...prev,
            { 
              type: 'question', 
              content: question || "Image analysis request", 
              image: URL.createObjectURL(selectedImage)
            },
            { 
              type: 'answer', 
              content: result.response.text() 
            }
          ]);
        } else {
          await run(question);
        }
      } catch (error) {
        console.error("Error sending request:", error);
        setAnswer("Sorry, I couldn't process your request. Please try again!");
      }
      setGeneratingAnswer(false);
      setQuestion("");
      setSelectedImage(null);
  }
  
    const handleClearHistory = () => {
        setChatHistory([]);
    };

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        {/* Fixed Header */}
        <header className="text-center py-4 flex justify-between items-center">
          <a href="https://doubtgpt.netlify.app" 
             target="_blank" 
             rel="noopener noreferrer"
             className="block">
            <h1 className="text-4xl font-bold text-blue-500 hover:text-blue-600 transition-colors">
              DoubtGPT
            </h1>
          </a>
          {chatHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
            >
              Clear History
            </button>
          )}
        </header>

        {/* Scrollable Chat Container - Updated className */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4 hide-scrollbar"
        >
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="bg-blue-50 rounded-xl p-8 max-w-2xl">
                <h2 className="text-2xl font-bold text-blue-600 mb-4">Welcome to DoubtGPT! 👋 </h2>
                <p className="text-gray-600 mb-4">
                  I'm here to help you with anything you'd like to know. You can ask me about: 
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">⚛️</span> Physucks
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">🧪</span> Kemistry
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">🧮</span> Meths
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-blue-500">😡</span> Nonsense Advice
                  </div>
                </div>
                <p className="text-gray-500 mt-6 text-sm">
                  Just type your question below and press Enter or click Send!
                </p>
              </div>
            </div>
          ) : (
            <>
              {chatHistory.map((chat, index) => (
                <div key={index} className={`mb-4 ${chat.type === 'question' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${
                    chat.type === 'question' 
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    <ReactMarkdown 
  className="overflow-auto hide-scrollbar"
  remarkPlugins={[remarkMath]}
  rehypePlugins={[rehypeKatex]}
>
  {chat.content}
</ReactMarkdown>
                    {chat.image && (
                      <img src={chat.image} alt="Uploaded" className="chat-image" />
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          {generatingAnswer && (
            <div className="text-left">
              <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
                Thinking...
              </div>
            </div>
          )}
          {selectedImage && (
            <div className="text-left">
              <img src={URL.createObjectURL(selectedImage)} alt="Uploaded" className="uploaded-image" />
            </div>
          )}
        </div>

        {/* Fixed Input Form */}
        <form
          onSubmit={generateAnswer}
          className="bg-white rounded-lg shadow-lg p-4 flex items-center gap-2"
        >
          <textarea
            className="flex-1 border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask me any question..."
            rows="2"
          ></textarea>
          <div className="button-group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                Upload
              </label>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
              >
                Send
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;