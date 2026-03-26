// New_Game.jsx
import React from 'react';
import './New_Game.css';

const NewGame = ({ onStart, onClose }) => {
  return (
    <div className="modal">
      <div className="modal-content">
        <h2>New Game</h2>
        <p>Start a new game with current settings?</p>
        <button onClick={onStart}>Yes</button>
        <button onClose={onClose}>No</button>
      </div>
    </div>
  );
};

export default NewGame;