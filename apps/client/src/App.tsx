import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import TicTacToe from './components/TicTacToe'
import './App.css'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="card">
      <p className="test-banner">Test task completed successfully!</p>
      <button onClick={() => setCount((count) => count + 1)}>
        count is {count}
      </button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tic-tac-toe" element={<TicTacToe />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
