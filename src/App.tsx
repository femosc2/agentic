import { Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { TasksPage } from './pages/TasksPage'
import { CommitsPage } from './pages/CommitsPage'
import { FmailPage } from './pages/FmailPage'
import { FformsPage } from './pages/FformsPage'
import './App.scss'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<TasksPage />} />
          <Route path="/commits" element={<CommitsPage />} />
          <Route path="/fmail" element={<FmailPage />} />
          <Route path="/fforms" element={<FformsPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
