import { useEffect, useState } from 'react'
import './App.css'

const symbols = [<i class="fa-solid fa-face-smile"></i>,
<i class="fa-solid fa-music"></i>,
<i class="fa-solid fa-bicycle"></i>,
<i class="fa-solid fa-plane"></i>,
<i class="fa-solid fa-skull-crossbones"></i>,
]
const powerUpCards = [
  <i class="fa-mosaic fa-solid fa-stopwatch"></i>,
  <i class="fa-solid fa-bomb"></i>,
]
const initialPlayers = [
  { name: 'Player 1', score: 0 },
  { name: 'Player 2', score: 0 },
]
const initialTime = 60

function createDeck() {
  return [...symbols, ...symbols, ...powerUpCards]
    .map((symbol, index) => ({
      id: `${symbol}-${index}-${Math.random().toString(16).slice(2)}`,
      symbol,
      matched: false,
    }))
    .sort(() => Math.random() - 0.5)
}

function App() {
  const [cards, setCards] = useState(() => createDeck())
  const [selectedIds, setSelectedIds] = useState([])
  const [moves, setMoves] = useState(0)
  const [gameState, setGameState] = useState('playing')
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [players, setPlayers] = useState(initialPlayers)
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0)
  const [activeView, setActiveView] = useState('home')
  const [timeLeft, setTimeLeft] = useState(initialTime)

  useEffect(() => {
    if (activeView !== 'game' || gameState !== 'playing') return

    const timerId = window.setInterval(() => {
      setTimeLeft((currentTime) => {
        if (currentTime <= 1) {
          setGameState('lost')
          return 0
        }
        return currentTime - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [activeView, gameState])

  useEffect(() => {
    if (selectedIds.length !== 2) return

    const [firstId, secondId] = selectedIds
    const firstCard = cards.find((card) => card.id === firstId)
    const secondCard = cards.find((card) => card.id === secondId)

    if (!firstCard || !secondCard) return

    setMoves((current) => current + 1)

    if (firstCard.symbol === secondCard.symbol) {
      setCards((currentCards) =>
        currentCards.map((card) =>
          card.id === firstId || card.id === secondId ? { ...card, matched: true } : card,
        ),
      )
      setPlayers((currentPlayers) =>
        currentPlayers.map((player, index) =>
          index === currentPlayerIndex ? { ...player, score: player.score + 10 } : player,
        ),
      )
      setMatchedPairs((current) => {
        const nextValue = current + 1
        if (nextValue >= symbols.length) {
          setGameState('won')
        }
        return nextValue
      })

      setSelectedIds([])
      return
    }
    const timeoutId = window.setTimeout(() => {
      setSelectedIds([])
      setCurrentPlayerIndex((current) => (current + 1) % players.length)
    }, 700)

   return () => window.clearTimeout(timeoutId)
  }, [selectedIds, cards, currentPlayerIndex, players.length])

  function resetGame() {
    setCards(createDeck())
    setSelectedIds([])
    setMoves(0)
    setMatchedPairs(0)
    setGameState('playing')
    setPlayers(initialPlayers)
    setCurrentPlayerIndex(0)
    setTimeLeft(initialTime)
  }
  function handleCardClick(card) {
    if (gameState !== 'playing') return
    if (card.matched || selectedIds.includes(card.id)) return
    if (selectedIds.length === 2) return

    const cardClassName = card.symbol.props.className || card.symbol.props.class || ''
    if (cardClassName.includes('stopwatch')) {
      setTimeLeft((currentTime) => currentTime + 20)
    } else if (cardClassName.includes('bomb')) {
      setTimeLeft((currentTime) => Math.max(0, currentTime - 20))
    }

    setSelectedIds((current) => [...current, card.id])
  }
  const highestScore = Math.max(...players.map((player) => player.score))
  const winnerName = players.find((player) => player.score === highestScore)?.name
  const statusText =
    gameState === 'won'
      ? `${winnerName} wins with ${highestScore} points!`
      : gameState === 'lost'
        ? 'Time is up! Restart to play again.'
      : `${players[currentPlayerIndex].name}'s turn — find a match!`
  
  const renderGameView = () => (
    <div className="game-shell">
      <div className="game-header">
        <div>
          <p className="eyebrow">Puzzle Challenge</p>
          <h1>Memory Blast</h1>
        </div>
        <button type="button" className="restart-button" onClick={resetGame}>
          Restart
        </button>
      </div>

      <div className="players-panel">
        {players.map((player, index) => (
          <div key={player.name} className={`player-card ${index === currentPlayerIndex ? 'active' : ''}`}>
            <span>{player.name}</span>
            <strong>{player.score} pts</strong>
            {index === currentPlayerIndex && gameState === 'playing' ? <small>Turn</small> : null}
          </div>
        ))}
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span>Moves</span>
          <strong>{moves}</strong>
        </div>
        <div className="stat">
          <span>Pairs</span>
          <strong>
            {matchedPairs}/{symbols.length}
          </strong>
        </div>
        <div className="stat">
          <span>Turn</span>
          <strong>{players[currentPlayerIndex].name}</strong>
        </div>
        <div className="stat timer-stat">
          <span>Time</span>
          <strong>{timeLeft}s</strong>
        </div>
      </div>

      <div className={`message-banner ${gameState}`}>{statusText}</div>

      <div className="board" role="grid" aria-label="Memory matching board">
        {cards.map((card) => {
          const isFaceUp = selectedIds.includes(card.id) || card.matched
          const isBusy = selectedIds.length === 2 && !selectedIds.includes(card.id)

          return (
            <button
              key={card.id}
              type="button"
              className={`memory-card ${isFaceUp ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
              onClick={() => handleCardClick(card)}
              aria-label={isFaceUp ? `Card showing ${card.symbol}` : 'Hidden card'}
              disabled={card.matched || gameState !== 'playing' || isBusy}
            >
              <span className="card-inner">
                <span className="card-face card-front">?</span>
                <span className="card-face card-back">{card.symbol}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderHomeView = () => (
    <div className="panel-box landing-page">
      <p className="eyebrow">Welcome to</p>
      <h1>Memory Blast</h1>
      <p className="landing-copy">
        Match every glowing pair and boost your learning power.
      </p>
      <button
        type="button"
        className="start-button"
        onClick={() => {
          resetGame()
          setActiveView('game')
        }}
      >
        Start Playing
      </button>
    </div>
  )

  const renderSettingsView = () => (
    <div className="panel-box settings-page">
      <p className="eyebrow">Game Settings</p>
      <h2>Customize your match</h2>
      <div className="settings-list">
        <div className="setting-item">
          <span>Players</span>
          <strong>2</strong>
        </div>
        <div className="setting-item">
          <span>Theme</span>
          <strong>Neon Arcade</strong>
        </div>
        <div className="setting-item">
          <span>Mode</span>
          <strong>Classic Match</strong>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {activeView === 'game' && (
        <nav className="top-nav" aria-label="Main navigation">
          <div className="nav-brand">Memory Blast</div>
          <div className="nav-actions">
            <button
              type="button"
              className={`nav-button ${activeView === 'home' ? 'active' : ''}`}
              onClick={() => setActiveView('home')}
            >
              Home
            </button>
            <button
              type="button"
              className={`nav-button ${activeView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
            >
              Settings
            </button>
          </div>
        </nav>
      )}

      {activeView === 'home' ? renderHomeView() : activeView === 'settings' ? renderSettingsView() : renderGameView()}
    </>
  )
}

export default App
