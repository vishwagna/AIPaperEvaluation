import React, { useState } from 'react';


// Set the workerSrc to the path where it's copied in the dist folder

function Question({ questionText }) {
  const [file, setFile] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(-1);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [msg, setMsg] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileSubmit = async (event) => {
    event.preventDefault();
  
    if (isSubmitted) {
      setError('You have already submitted an answer.');
      return;
    }
  
    if (file) {
      try {
        // Prepare the form data
        const formData = new FormData();
        formData.append('file', file);
  
        // Send the file to the server
        const response = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          const result = await response.json();
          console.log(result);
          const extractedText = result.text;
  
          setAnswer(extractedText);
          setMsg('PDF uploaded and text extracted successfully');
          setError('');
  
        } else {
          console.error('Failed to extract text');
          setError('Failed to extract text. Please try again.');
        }
      } catch (error) {
        console.error('Error during file submission:', error);
        setError('An error occurred. Please try again.');
      }
    } else {
      setError('Please upload a PDF file.');
    }
  };
  const handleAnswerSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitted) {
      setError('You have already submitted an answer.');
      return;
    }

    if (!answer.trim()) {
      setError('Please enter an answer.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      if (response.ok) {
        const resultText = JSON.parse(await response.text());
        console.log('Form submitted successfully');
        console.log('Response text:', resultText);
        setFeedback(resultText.feedback);
        setScore(resultText.score);
        setError('');
        setIsSubmitted(true);
      } else {
        console.error('Form submission failed');
        setError('Form submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const closeError = () => {
    setError('');
    setMsg('');
  };

  const formattedScore = `Score: ${score}/10`;
  const textColor = score > 5 ? 'text-green-500' : 'text-red-500';

  return (
    <div className="border p-4 rounded-lg shadow-lg mb-6">
      {error && (
        <div className="text-red-500 mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={closeError} className="ml-2 text-xl">
            &times;
          </button>
        </div>
      )}
      {msg && (
        <div className="text-green-500 mb-4 flex justify-between items-center">
          <span>{msg}</span>
          <button onClick={closeError} className="ml-2 text-xl">
            &times;
          </button>
        </div>
      )}
      <p className="text-lg font-semibold mb-4">{questionText}</p>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows="4"
        placeholder="Write your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={isSubmitted}
      ></textarea>
      <button
        type="submit"
        onClick={handleAnswerSubmit}
        className={`bg-blue-500 text-white px-4 py-2 rounded mr-2 ${
          isSubmitted ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isSubmitted}
      >
        Evaluate
      </button>
      <div className="mt-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept="application/pdf, image/*"
          className="mb-2"
          disabled={isSubmitted}
        />
        <button
          onClick={handleFileSubmit}
          className={`bg-green-500 text-white px-4 py-2 rounded ${
            isSubmitted ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitted}
        >
          Upload File
        </button>
      </div>
      {score !== -1 && (
        <div
          className={`mt-4 p-4 border-t border-gray-200 rounded bg-gray`}
          style={{ float: 'right', width: '200px' }}
        >
          <p className={textColor}>{formattedScore}</p>
        </div>
      )}
      <br />
      <br />
      {feedback && (
        <div className="mt-4 p-4 border-t border-gray-200 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Feedback:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
}

export default Question;
