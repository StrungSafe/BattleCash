import { useState } from 'react';
import './App.css';

function Menu({ startGame }) {
  return (
    <div className='app-menu'>
      this is the menu
      <input className='app-menu__start' type='button' onClick={startGame} value='Start' />
    </div>
  )
}

function Arena() {
  return (
    <div className='app-arena'>
      <div className='app-arena_player app-arena_opponent'>
        <img className='app-arena_nft' src='https://nfts.bch.guru/img/drops/1.png' />
      </div>
      <div className='app-arena_message'>
        Preparing for Battle!
      </div>
      <div className='app-arena_player app-arena_user'>
        <img className='app-arena_nft' src='https://nfts.bch.guru/img/drops/2.png' />
      </div>
    </div>
  )
}

function App() {
  const [initialized, setInitialized] = useState(false);
  return (
    <div className='app'>
      <header className='app-header'>
        <p>
          BattleCash
        </p>
      </header>
      <main className='app-main'>
        {
            !initialized && (
              <Menu startGame={() => setInitialized(true)} />
            )
          }
          {
            initialized && (
              <Arena />
            )
          }
      </main>
      <footer className='app-footer'>
        <div>
          BCHBlaze 2025
        </div>
      </footer>
    </div>
  );
}

export default App;
