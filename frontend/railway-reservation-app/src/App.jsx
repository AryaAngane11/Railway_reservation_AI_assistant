import React, { useState , useEffect} from "react";
import './App.css'
const App = () => {
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [selectedTrain, setSelectedTrain] = useState("");
  const [numPassengers, setNumPassengers] = useState(1);
  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "" }]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [formFields, setformFields]= useState({})


  useEffect(() => {
  console.log("Updated messages:", messages);

  if(formFields != {}){
   try{
    setFromCity(formFields.startDestination)
    setToCity(formFields.endDestination)
    setTravelDate(formFields.dateOfJourney)
    setSelectedTrain(formFields.trainName)
    setNumPassengers(formFields.numberOfPassengers)
    if(formFields.passengers.length != 0){
      setPassengers(formFields.passengers)
    } 
   }catch(err){
    console.log("Error while updating form : ",err)
   }
  }

}, [messages, formFields]);

  // 🎤 Voice input using Web Speech API
  const handleVoiceInput = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-IN";
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      console.log(transcript)
    };
  };

  const handleNumPassengersChange = (num) => {
    setNumPassengers(num);
    const updated = Array.from({ length: num }, (_, i) => passengers[i] || { name: "", age: "", gender: "" });
    setPassengers(updated);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Reservation submitted!");
  };

  const handleAImessage = async (userInput) => {
  

  const userMessage = {"message":userInput}
  
  try {
    const res = await fetch("http://127.0.0.1:8000/userMessageforAI", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userMessage),
    });

    const data = await res.json();
    console.log(data);
    setformFields(data.formFields)
    setMessages((prev)=>[...prev,{"role":"ai","content":data.message}]);
    if(data.audio){
      const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
      audio.play();
    }
    console.log(messages)
  } catch (error) {
    console.error("Error recieving Ai messages:", error);
    alert("Error recieving Ai messages:");
  }
};

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages((prev)=>[...prev,{"role":"user","content":input}]);
      // Simulate AI reply
      handleAImessage(input)
      setInput("");
    }
  };

 

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left 2/3: Reservation Form */}
      <div className="w-2/3 p-6 text-black  bg-white shadow-lg overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">🚆 Railway Reservation Form</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="From City"
              className="border p-2 rounded"
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="To City"
              className="border p-2 rounded"
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
              required
            />
          </div>

          <input
            type="date"
            className="border p-2 rounded w-full"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            required
          />

          <select
            className="border p-2 rounded w-full"
            value={selectedTrain}
            onChange={(e) => setSelectedTrain(e.target.value)}
          >
            <option value="">Select Train</option>
            <option value="Rajdhani Express">Rajdhani Express</option> 
            <option value="Duronto Express">Duronto Express</option>
            <option value="Shatabdi Express">Shatabdi Express</option>
            <option value="Garib Rath Express">Garib Rath Express</option>
            <option value="Vande Bharat Express">Vande Bharat Express</option>
          </select>

          <div>
            <label className="block mb-1">Number of Passengers</label>
            <input
              type="number"
              min="1"
              max="6"
              className="border p-2 rounded w-full"
              value={numPassengers}
              onChange={(e) => handleNumPassengersChange(parseInt(e.target.value))}
            />
          </div>

          <div className="mt-4 space-y-4">
            {passengers.map((p, index) => (
              <div key={index} className="border p-4 rounded bg-gray-50">
                <h3 className="font-semibold mb-2">Passenger {index + 1}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name"
                    className="border p-2 rounded"
                    value={p.name}
                    onChange={(e) => handlePassengerChange(index, "name", e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    className="border p-2 rounded"
                    value={p.age}
                    onChange={(e) => handlePassengerChange(index, "age", e.target.value)}
                    required
                  />
                  <select
                    className="border p-2 rounded"
                    value={p.gender}
                    onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                    required
                  >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Confirm Reservation
          </button>
        </form>
      </div>

      {/* Right 1/3: AI Chatbot */}
      <div className="w-1/3 bg-gray-900 text-white flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-2 rounded-lg max-w-xs ${
                msg.role === "user"
                  ? "bg-blue-600 self-end ml-auto"
                  : "bg-gray-700 self-start"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>

        {/* Chat input */}
        <div className="p-3 flex gap-2 border-t border-gray-700">
          <button
            onClick={handleVoiceInput}
            className="bg-amber-50 p-2 rounded-full hover:bg-red-700"
            title="Speak"
          >
            🎤
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI..."
            className="flex-1 p-2 rounded text-white"
          />
          <button
            onClick={handleSendMessage}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
