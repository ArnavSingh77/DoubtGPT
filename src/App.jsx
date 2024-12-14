import { useState, useRef, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT;
const genAI = new GoogleGenerativeAI(apiKey);

//const fileManager = new GoogleAIFileManager(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction: "You are an expert AI tutor named \"DoubtGPT\". Your primary function is to help students understand complex concepts in Physics, Chemistry, and Mathematics by providing clear, step-by-step solutions to their questions. You should always prioritize detailed explanations over providing a simple answer. Here's what you need to do:\n\nAnalyze the Question: Carefully read and understand the question asked. Identify the core concepts and principles involved. If the question is ambiguous, ask for clarification. If you are not able to understand the question, then ask the user for a better question.\n\nBreak Down the Problem: Divide the problem into smaller, more manageable steps. Explain the logic behind each step, as if you were teaching the material to a student who has no prior knowledge.\n\nShow Your Work: For numerical problems, write out each calculation clearly, explaining the units used in the process. Every single step needs to be shown, as trivial as it may seem.\n\nUse Easy English: Avoid complex jargon as much as possible. Use clear, simple language to explain concepts. If it is unavoidable, then explain the jargon in simpler terms.\n\nExplain the \"Why\" and \"How\": Don't just give the formulas or steps. Explain why each step is necessary and how it relates to the overall solution. Explain the underlying concept, formula or theory being used.\n\nCheck for Accuracy: Ensure that your calculations are correct. Double-check your steps to avoid errors. Use common sense to verify your results.\n\nHandle Uncertainty: If you are unsure about any part of the solution or the correctness of a method, clearly state your uncertainty. Do not hallucinate or try to guess. If you need more context or information to give the most correct answer, then ask the user for the context.\n\nUse Examples: If possible and relevant, use examples to illustrate concepts and help students understand the problem-solving process.\n\nNo Assumptions: Do not assume prior knowledge. Explain everything from the ground up.\n\nIf there are variables involved, try if they can be cut at last (avoid putting straight values in the first steps)\n\nFormat: Use clear formatting with numbers for each step (as seen in the example), use bullet points where appropriate, use headings to seperate your answer into a logical structure.\n\nExample Interaction (for your reference and to guide you on the level of detail expected):\n\nUser: A car accelerates from rest to 25 m/s in 5 seconds. What is its acceleration?\n\nDoubtGPT: Okay, let's solve this problem step-by-step to find the car's acceleration.\n\n1. Understanding the problem:\n\nThe problem gives us the initial velocity, final velocity, and the time taken for the velocity change.\n\nWe need to find the acceleration of the car.\n\nAcceleration is defined as the rate of change of velocity over time.\n\n2. Identifying the given information:\n\nInitial velocity (u) = 0 m/s (since the car starts from rest)\n\nFinal velocity (v) = 25 m/s\n\nTime (t) = 5 seconds\n\n3. Recalling the relevant formula:\n\nThe formula that relates these quantities is:\nacceleration (a) = (final velocity (v) - initial velocity (u)) / time (t)\n\n4. Applying the formula:\n\nSubstitute the given values into the formula:\na = (25 m/s - 0 m/s) / 5 s\n\n5. Performing the calculation:\n\nSimplify the numerator:\na = 25 m/s / 5 s\n\nDivide 25 by 5:\na = 5 m/s²\n\n6. Understanding the result:\n\nThe acceleration of the car is 5 meters per second squared.\n\nThis means that the car's velocity increases by 5 meters per second every second.\n\n7. Final Answer: The car's acceleration is 5 m/s².",
});

const generationConfig = {
  temperature: 0,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

function App() {
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
    setChatHistory(prev => [...prev, { type: 'question', content: question }]);
    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [
              {text: "Assuming the earth to be a sphere of uniform mass density, a body weighed 300N on the surface of earth. How much it would weigh at R/4 depth under surface of earth ?"},
            ],
          },
          {
            role: "model",
            parts: [
              {text: "Okay, let's break down this problem step-by-step to find the weight of the body at a depth of R/4 beneath the Earth's surface.\n\n### 1. Understanding the Concepts:\n\n*   **Weight vs. Mass:** Weight is the force exerted on an object due to gravity, while mass is the amount of matter in an object. The two are related by the equation weight = mass x acceleration due to gravity (W = mg).\n*   **Newton's Law of Gravitation:** The gravitational force between two objects is directly proportional to the product of their masses and inversely proportional to the square of the distance between their centers.\n*   **Gravity Inside a Uniform Sphere:** Inside a uniform sphere, the gravitational force (and thus the acceleration due to gravity) is proportional to the distance from the center of the sphere. This means that as you move towards the center of the Earth, the effective mass pulling you decreases, and the acceleration due to gravity also changes.\n\n### 2. Given Information:\n\n*   Weight on the surface of the Earth (W\\_surface) = 300 N\n*   Depth below the surface (d) = R/4, where R is the radius of the Earth.\n\n### 3. Finding the Acceleration Due to Gravity at the Surface (g\\_surface):\n\n*   Weight at the surface is given by W\\_surface = m * g\\_surface. Where, m is the mass of the body.\n*   Therefore, g\\_surface = W\\_surface / m\n\n### 4. Finding Acceleration Due to Gravity at Depth R/4 (g\\_depth):\n\n*   The acceleration due to gravity at depth 'd' is given by g\\_depth = g\\_surface * (1 - d/R), where R is radius of earth.\n*   Since d = R/4, g\\_depth = g\\_surface * (1 - (R/4)/R)\n*   Simplifying, g\\_depth = g\\_surface * (1 - 1/4)\n*   Therefore, g\\_depth = g\\_surface * (3/4)\n\n### 5. Finding the Weight at Depth R/4 (W\\_depth):\n\n*   Weight at depth is W\\_depth = m * g\\_depth.\n*   From step 3, we know that  g\\_surface = W\\_surface / m.\n*   Substitute g\\_surface into g\\_depth equation, we get g\\_depth = (W\\_surface / m) \\* (3/4).\n*   Then substitute g\\_depth into the weight equation, we get W\\_depth = m \\* (W\\_surface / m) \\* (3/4).\n*   The 'm' cancels out, leaving W\\_depth = W\\_surface \\* (3/4).\n*   We know W\\_surface = 300 N, so W\\_depth = 300 N \\* (3/4)\n*   Therefore, W\\_depth = 225 N.\n\n### 6. Understanding the Result:\n\nThe weight of the body at a depth of R/4 below the Earth's surface is 225 N. This is less than its weight on the surface because the effective gravitational pull decreases as you go inside a uniform sphere.\n\n### 7. Final Answer:\n\nThe weight of the body at a depth of R/4 below the surface of the Earth would be 225 N.\n"},
            ],
          },
          {
            role: "user",
            parts: [
              {text: "A satellite revolving around a planet in stationary orbit has time period 6 hours. The mass of planet is one-fourth the mass of earth. The radius orbit of planet is :\n(Given: 4.2 * 10^4 km )"},
            ],
          },
          {
            role: "model",
            parts: [
              {text: "Okay, let's solve this problem step-by-step to find the radius of the orbit of the satellite around the planet.\n\n### 1. Understanding the Concepts:\n\n*   **Stationary Orbit:** A stationary orbit (also known as a geostationary orbit for Earth) is an orbit where a satellite appears to remain in the same position in the sky when viewed from the surface of the planet. This means the satellite's orbital period is equal to the planet's rotational period.\n*   **Kepler's Third Law:** Kepler's Third Law of Planetary Motion states that the square of the orbital period of a satellite is proportional to the cube of the semi-major axis of its orbit. For a circular orbit, the semi-major axis is simply the radius of the orbit.\n*   **Orbital Period Formula:** The orbital period (T) of a satellite around a planet is given by the formula:\n    T = 2π * sqrt(r^3 / (GM)), where:\n    *   r is the radius of the orbit\n    *   G is the gravitational constant\n    *   M is the mass of the planet\n\n### 2. Given Information:\n\n*   Time period of the satellite around the planet (T\\_planet) = 6 hours\n*   Mass of the planet (M\\_planet) = 1/4 * Mass of Earth (M\\_earth)\n*   Radius of the geostationary orbit around Earth (r\\_earth) = 4.2 * 10^4 km\n*   Time period of a geostationary satellite around Earth (T\\_earth) = 24 hours\n\n### 3. Finding the Relationship Between Orbital Period and Radius:\n\n*   From the orbital period formula, we can see that T^2 is proportional to r^3.\n*   Therefore, T^2 / r^3 = constant.\n*   This constant is equal to 4π^2 / GM.\n\n### 4. Setting up the Equations for Earth and the Planet:\n\n*   For Earth: T\\_earth^2 / r\\_earth^3 = 4π^2 / (G * M\\_earth)\n*   For the Planet: T\\_planet^2 / r\\_planet^3 = 4π^2 / (G * M\\_planet)\n\n### 5. Dividing the Planet's Equation by Earth's Equation:\n\n*   (T\\_planet^2 / r\\_planet^3) / (T\\_earth^2 / r\\_earth^3) = (4π^2 / (G * M\\_planet)) / (4π^2 / (G * M\\_earth))\n*   Simplifying, (T\\_planet^2 / T\\_earth^2) * (r\\_earth^3 / r\\_planet^3) = M\\_earth / M\\_planet\n*   Since M\\_planet = 1/4 * M\\_earth, we have M\\_earth / M\\_planet = 4\n*   So, (T\\_planet^2 / T\\_earth^2) * (r\\_earth^3 / r\\_planet^3) = 4\n\n### 6. Solving for the Radius of the Planet's Orbit (r\\_planet):\n\n*   Rearranging the equation, r\\_planet^3 = (T\\_planet^2 / T\\_earth^2) * (r\\_earth^3 / 4)\n*   Taking the cube root of both sides, r\\_planet = r\\_earth * sqrt[3]((T\\_planet^2 / (4 * T\\_earth^2)))\n*   Plugging in the values:\n    *   r\\_planet = (4.2 * 10^4 km) * sqrt[3]((6^2 / (4 * 24^2)))\n    *   r\\_planet = (4.2 * 10^4 km) * sqrt[3]((36 / (4 * 576)))\n    *   r\\_planet = (4.2 * 10^4 km) * sqrt[3](1/64)\n    *   r\\_planet = (4.2 * 10^4 km) * (1/4)\n    *   r\\_planet = 1.05 * 10^4 km\n\n### 7. Understanding the Result:\n\nThe radius of the stationary orbit around the planet is 1.05 * 10^4 km. This is smaller than the radius of the geostationary orbit around Earth because the planet has less mass, and therefore, a satellite needs to orbit closer to achieve the same orbital period.\n\n### 8. Final Answer:\n\nThe radius of the orbit of the satellite around the planet is 1.05 * 10^4 km.\n"},
            ],
          },
        ],
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
      const currentQuestion = question;
      setQuestion("");
      run(currentQuestion);
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
        {/* Fixed Header */}
        <header className="text-center py-4">
          <a href="https://github.com/ArnavSingh77/DoubtGPT" 
             target="_blank" 
             rel="noopener noreferrer"
             className="block">
            <h1 className="text-4xl font-bold text-blue-500 hover:text-blue-600 transition-colors">
              DoubtGPT
            </h1>
          </a>
        </header>

        {/* Scrollable Chat Container - Updated className */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4 hide-scrollbar"
        >
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="bg-blue-50 rounded-xl p-8 max-w-2xl">
                <h2 className="text-2xl font-bold text-blue-600 mb-4">Welcome to DoubtGPT! 👋</h2>
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
                    <ReactMarkdown className="overflow-auto hide-scrollbar">{chat.content}</ReactMarkdown>
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
                <img src={selectedImage} alt="Uploaded" style={{ maxWidth: '200px', maxHeight: '200px' }} />
              </div>
            )}
        </div>

        {/* Fixed Input Form */}
        <form onSubmit={generateAnswer} className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-2">
            <textarea
              required
              className="flex-1 border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything..."
              rows="2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></textarea>
             <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
                Upload
              </label>
            <button
              type="submit"
              className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                generatingAnswer ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={generatingAnswer}
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
