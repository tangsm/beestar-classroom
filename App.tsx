
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, WordStatus } from './types';
import { BEE_WORDS, SUCCESS_MESSAGES, ENCOURAGEMENT_MESSAGES } from './constants';
import { playWordAudio } from './services/audioService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [results, setResults] = useState<WordStatus[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showWrongWords, setShowWrongWords] = useState(false);
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Initialize game
  const startGame = () => {
    const shuffled = [...BEE_WORDS].sort(() => Math.random() - 0.5);
    setWords(shuffled);
    setCurrentIndex(0);
    setResults([]);
    setGameState(GameState.PLAYING);
    setMessage("Get ready! Listen to the first word.");
    setShowWrongWords(false);
  };

  const handlePlayAudio = async () => {
    if (!words[currentIndex]) return;
    setLoadingAudio(true);
    await playWordAudio(words[currentIndex]);
    setLoadingAudio(false);
  };

  useEffect(() => {
    if (gameState === GameState.PLAYING && words.length > 0) {
      handlePlayAudio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, gameState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const currentWord = words[currentIndex].toLowerCase();
    const userWord = userAnswer.trim().toLowerCase();
    const isCorrect = currentWord === userWord;

    const newResult: WordStatus = {
      word: words[currentIndex],
      isCorrect,
      userAttempt: userWord
    };

    setResults(prev => [...prev, newResult]);
    setUserAnswer('');

    if (isCorrect) {
      setMessage(SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)]);
    } else {
      setMessage(ENCOURAGEMENT_MESSAGES[Math.floor(Math.random() * ENCOURAGEMENT_MESSAGES.length)]);
    }

    if (currentIndex < words.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setMessage('');
      }, 2000);
    } else {
      setTimeout(() => {
        setGameState(GameState.END);
      }, 2000);
    }
  };

  const score = useMemo(() => results.filter(r => r.isCorrect).length, [results]);
  const wrongWords = useMemo(() => results.filter(r => !r.isCorrect), [results]);

  const renderStart = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
      <div className="bg-yellow-400 p-8 rounded-full shadow-lg mb-8 animate-bounce">
        <span className="text-6xl">🐝</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-bee text-yellow-600 mb-4 drop-shadow-sm">Bee Star</h1>
      <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-md">
        Test your spelling skills with the official One Bee Study List for 3rd Grade!
      </p>
      <button
        onClick={startGame}
        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-10 rounded-full text-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
      >
        Start Game
      </button>
    </div>
  );

  const renderPlaying = () => (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <span className="bg-yellow-100 text-yellow-800 font-bold py-1 px-4 rounded-full">
          Word {currentIndex + 1} of {words.length}
        </span>
        <span className="bg-green-100 text-green-800 font-bold py-1 px-4 rounded-full">
          Score: {score}
        </span>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center border-4 border-yellow-200">
        <div className="mb-8">
          <button
            onClick={handlePlayAudio}
            disabled={loadingAudio}
            className={`p-6 rounded-full ${loadingAudio ? 'bg-gray-200' : 'bg-yellow-400 hover:bg-yellow-500'} shadow-lg transition-transform active:scale-90`}
          >
            {loadingAudio ? (
              <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
          <p className="mt-4 text-gray-500 font-medium">Click to hear the word</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            autoFocus
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full text-center text-3xl md:text-4xl border-b-4 border-yellow-400 focus:outline-none focus:border-yellow-600 transition-colors py-2 uppercase tracking-widest text-gray-700"
            placeholder="TYPE HERE"
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-2xl text-xl transition-all shadow-md"
          >
            Check Word
          </button>
        </form>

        {message && (
          <div className={`mt-8 p-4 rounded-2xl animate-fade-in ${message.includes('superstar') || message.includes('job') || message.includes('amazing') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
            <p className="text-xl font-bold">{message}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEnd = () => (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h2 className="text-5xl font-bee text-yellow-600 mb-4">Bee-rilliant!</h2>
      <div className="bg-white rounded-3xl shadow-xl p-10 mb-8 border-4 border-yellow-200">
        <div className="text-8xl mb-4">🏁</div>
        <p className="text-2xl text-gray-600 mb-2">You finished the game!</p>
        <div className="text-6xl font-bold text-yellow-500 mb-6">
          {score} / {words.length}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={startGame}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all"
          >
            Play Again
          </button>
          {wrongWords.length > 0 && (
            <button
              onClick={() => setShowWrongWords(!showWrongWords)}
              className="bg-white hover:bg-gray-50 text-yellow-600 border-2 border-yellow-500 font-bold py-3 px-8 rounded-full text-xl shadow-lg transition-all"
            >
              {showWrongWords ? "Hide Mistakes" : "Review Mistakes"}
            </button>
          )}
        </div>
      </div>

      {showWrongWords && (
        <div className="bg-white rounded-3xl shadow-lg p-8 text-left animate-slide-up border-2 border-red-100">
          <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
            <span>📝</span> Words to Practice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wrongWords.map((item, idx) => (
              <div key={idx} className="flex flex-col p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg text-gray-800 uppercase tracking-wide">{item.word}</span>
                  <button onClick={() => playWordAudio(item.word)} className="text-gray-400 hover:text-yellow-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                </div>
                <span className="text-sm text-red-500">Your attempt: {item.userAttempt || 'No answer'}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-gray-600 italic text-center">
            "Mistakes are proof that you are trying. Keep practicing, little bee!" 🐝
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-yellow-400 py-4 px-6 shadow-md mb-8 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setGameState(GameState.START)}>
          <span className="text-2xl">🐝</span>
          <span className="font-bee text-2xl text-yellow-900 hidden sm:inline">BEE STAR</span>
        </div>
        <div className="bg-yellow-900/10 px-4 py-1 rounded-full text-sm font-bold text-yellow-900">
          3rd Grade Edition
        </div>
      </header>

      <main className="container mx-auto px-4">
        {gameState === GameState.START && renderStart()}
        {gameState === GameState.PLAYING && renderPlaying()}
        {gameState === GameState.END && renderEnd()}
      </main>

      <footer className="mt-auto py-8 text-center text-gray-400 text-sm">
        <p>© 2025 Bee Star Spelling Bee • For Educational Fun</p>
      </footer>
    </div>
  );
};

export default App;
