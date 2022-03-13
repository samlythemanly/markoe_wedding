import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import {
  accommodationsRoute,
  dressCodeRoute,
  gettingThereRoute,
  ourStoryRoute,
  registryRoute,
  rootRoute,
  rsvpRoute,
} from './common/navigation';
import './index.css';
import { HomePage } from './widgets/home_page';
import { NavBar } from './widgets/nav_bar';


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path={ rootRoute }
               element={ <HomePage /> } />
        <Route path={ accommodationsRoute }
               element={ <div>
                 Accomodations
               </div> } />
        <Route path={ dressCodeRoute }
               element={ <div>
                 Dress code
               </div> } />
        <Route path={ gettingThereRoute }
               element={ <div>
                 Getting there
               </div> } />
        <Route path={ ourStoryRoute }
               element={ <div>
                 Our story
               </div> } />
        <Route path={ rsvpRoute }
               element={ <div>
                 RSVP
               </div> } />
        <Route path={ registryRoute }
               element={ <div>
                 Registry
               </div> } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
