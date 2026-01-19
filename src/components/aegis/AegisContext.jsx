import React, { createContext, useContext, useState } from 'react';

const AegisContext = createContext();

export function useAegis() {
  const context = useContext(AegisContext);
  if (!context) {
    throw new Error('useAegis must be used within AegisProvider');
  }
  return context;
}

export function AegisProvider({ children }) {
  const [missionState, setMissionState] = useState(null);
  const [threatLevel, setThreatLevel] = useState(0);
  const [activeClocks, setActiveClocks] = useState([]);
  const [clearanceLevel, setClearanceLevel] = useState('field_operative');
  const [echoEvents, setEchoEvents] = useState([]);
  
  const analyzeThreat = async (operationalFrame) => {
    // Future: API call to A.E.G.I.S. backend
    // For now, return structured response
    return {
      tier: 1,
      recommendations: [],
      clocks: [],
      clearance: clearanceLevel
    };
  };
  
  const updateMissionState = (state) => {
    setMissionState(state);
  };
  
  const addClock = (clock) => {
    setActiveClocks(prev => [...prev, clock]);
  };
  
  const tickClock = (clockId, ticks = 1) => {
    setActiveClocks(prev => 
      prev.map(clock => 
        clock.id === clockId 
          ? { ...clock, current: Math.min(clock.current + ticks, clock.max) }
          : clock
      )
    );
  };
  
  const addEchoEvent = (event) => {
    setEchoEvents(prev => [...prev, event]);
  };
  
  const updateEchoEvent = (eventId, updates) => {
    setEchoEvents(prev =>
      prev.map(e => e.id === eventId ? { ...e, ...updates } : e)
    );
  };
  
  const removeEchoEvent = (eventId) => {
    setEchoEvents(prev => prev.filter(e => e.id !== eventId));
  };
  
  const value = {
    missionState,
    threatLevel,
    activeClocks,
    clearanceLevel,
    echoEvents,
    analyzeThreat,
    updateMissionState,
    addClock,
    tickClock,
    setThreatLevel,
    setClearanceLevel,
    addEchoEvent,
    updateEchoEvent,
    removeEchoEvent
  };
  
  return (
    <AegisContext.Provider value={value}>
      {children}
    </AegisContext.Provider>
  );
}