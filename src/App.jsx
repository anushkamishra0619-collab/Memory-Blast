import { useEffect, useState } from 'react'
import './App.css'

const symbols = ['🌙', '⚡', '🎯', '🚀', '⭐', '🎲', '🎵', '💎']
const GAME_TIME = 60

function createDeck() {
  return [...symbols, ...symbols]
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
  const [secondsLeft, setSecondsLeft] = useState(GAME_TIME)
  const [gameState, setGameState] = useState('playing')
  const [matchedPairs, setMatchedPairs] = useState(0)

  useEffect(() => {
    if (gameState !== 'playing') return

    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timer)
          setGameState('lost')
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState])

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
    }, 700)

    return () => window.clearTimeout(timeoutId)
  }, [selectedIds, cards])

  function resetGame() {
    setCards(createDeck())
    setSelectedIds([])
    setMoves(0)
    setSecondsLeft(GAME_TIME)
    setMatchedPairs(0)
    setGameState('playing')
  }

  function handleCardClick(card) {
    if (gameState !== 'playing') return
    if (card.matched || selectedIds.includes(card.id)) return
    if (selectedIds.length === 2) return

    setSelectedIds((current) => [...current, card.id])
  }

  const statusText =
    gameState === 'won'
      ? 'You cleared the board!'
      : gameState === 'lost'
        ? 'Time is up!'
        : 'Find every matching pair!'

  return (
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
          <span>Time</span>
          <strong>{secondsLeft}s</strong>
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
}

export default App
