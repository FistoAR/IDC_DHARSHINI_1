// useHistory.js
import { useState, useRef, useCallback } from 'react';

const useHistory = () => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const historyRef = useRef({ 
    undoStack: [], 
    redoStack: [], 
    isPerforming: false 
  });

  const saveToHistory = useCallback((state) => {
    if (historyRef.current.isPerforming) return;

    const jsonString = JSON.stringify(state);
    
    const lastState = historyRef.current.undoStack[historyRef.current.undoStack.length - 1];
    if (lastState === jsonString) return;

    historyRef.current.undoStack.push(jsonString);
    historyRef.current.redoStack = [];

    if (historyRef.current.undoStack.length > 50) {
      historyRef.current.undoStack.shift();
    }

    setCanUndo(historyRef.current.undoStack.length > 1);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    const { undoStack, redoStack } = historyRef.current;
    
    if (undoStack.length <= 1) return;

    historyRef.current.isPerforming = true;

    const currentState = undoStack.pop();
    redoStack.push(currentState);

    const previousState = undoStack[undoStack.length - 1];
    
    historyRef.current.isPerforming = false;
    setCanUndo(undoStack.length > 1);
    setCanRedo(true);

    return JSON.parse(previousState);
  }, []);

  const redo = useCallback(() => {
    const { undoStack, redoStack } = historyRef.current;
    
    if (redoStack.length === 0) return;

    historyRef.current.isPerforming = true;

    const nextState = redoStack.pop();
    undoStack.push(nextState);
    
    historyRef.current.isPerforming = false;
    setCanUndo(true);
    setCanRedo(redoStack.length > 0);

    return JSON.parse(nextState);
  }, []);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    saveToHistory
  };
};

export default useHistory;