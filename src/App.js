import React, { Component } from 'react';
import Routes from './components/Routes';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';

class App extends Component {

  render() {
    return (
      <Routes />
    );
  }
}

export default App;