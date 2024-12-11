import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import Login from './Login';  // Import Login component
import TaskTracker from './TaskTracker';  // Import TaskTracker component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />  {/* Use element instead of component */}
        <Route path="/tasktracker" element={<TaskTracker />} /> {/* Use element instead of component */}
      </Routes>
    </Router>
  );
}

export default App;
