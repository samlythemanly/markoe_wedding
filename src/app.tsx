import { Component } from 'react';

import './app.css';

class App extends Component {
  public render(): JSX.Element {
    return (
      <div className='app'>
        <header className='app-header'>
          { 'Sam and Steph\'s wedding website' }
        </header>
      </div>
    );
  }
}

export default App;
