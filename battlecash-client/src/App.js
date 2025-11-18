import { useState } from 'react';
import Menu from './Menu';
import Arena from './Arena';

import './App.css';

function Lobby({ onChallenge }) {
  const challengers = [
    {
      name: 'Anon1',
      nft: 'category',
      imageUrl: 'https://nfts.bch.guru/img/drops/1.png',
    },
    {
      name: 'Anon2',
      nft: 'category2',
      imageUrl: 'https://nfts.bch.guru/img/drops/2.png',
    },
  ];
  return (
    <div style={{
      height: '100%',
      width: '66%',
      // backgroundColor: 'red',
      overflowY: 'scroll',
      scrollbarWidth: 'none',
      display: 'grid',
      alignContent: 'start',
      rowGap: '1rem',
    }}>
      {
        challengers.map(c => (
          <div style={{ display: 'grid', gridAutoFlow: 'column' }}>
            <div>
              {c.name}
            </div>
            <div>
              {c.nft}
            </div>
            <div>
              <img src={c.imageUrl} style={{ width: '4rem', height: '4rem' }} />
            </div>
            <div>
              <input type='button' value='Challenge' onClick={onChallenge} />
            </div>
          </div>
        ))
      }
    </div>
  )
}

function App() {
  const [initialized, setInitialized] = useState(false);
  const [activeBattle, setActiveBattle] = useState(false);
  const onChallenge = () => {
    setActiveBattle(true);
  };
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
            initialized && !activeBattle && ( 
              <Lobby onChallenge={onChallenge} />
            )
          }
          {
            initialized && activeBattle && (
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
