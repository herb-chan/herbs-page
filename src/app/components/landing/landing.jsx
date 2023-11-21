import { useState } from "react";

import Terminal from "../terminal/terminal";
import TerminalIcon from "../terminal_icon/icon";
import Notepad from "../notepad/notepad";
import NotepadIcon from "../notepad_icon/icon";

export default function Landing() {
    const [showTerminal, setShowTerminal] = useState(false);
    const [showNotepad, setShowNotepad] = useState(false);
    const [notepadIndex, setNotepadIndex] = useState(1);
    const [terminalIndex, setTerminalIndex] = useState(1);

    const toggleTerminal = () => {
        setShowTerminal(true);
        if (!showTerminal) {
            setTerminalIndex(2);
            setNotepadIndex(1); // Reset Notepad zIndex when Terminal is opened
        }
    };

    const closeTerminal = () => {
        setShowTerminal(false);
        setTerminalIndex(1); // Reset Terminal zIndex when closed
    };

    const toggleNotepad = () => {
        setShowNotepad(true);
        if (!showNotepad) {
            setNotepadIndex(2);
            setTerminalIndex(1); // Reset Terminal zIndex when Notepad is opened
        }
    };

    const closeNotepad = () => {
        setShowNotepad(false);
        setNotepadIndex(1); // Reset Notepad zIndex when closed
    };

    const handleTerminalClick = () => {
        setTerminalIndex(2);
        setNotepadIndex(1);
    };

    const handleNotepadClick = () => {
        setNotepadIndex(2);
        setTerminalIndex(1);
    };

    return (
        <main>
            {showNotepad && (
                <Notepad
                    closeNotepad={closeNotepad}
                    zIndex={notepadIndex}
                    handleNotepadClick={handleNotepadClick}
                />
            )}
            {showTerminal && (
                <Terminal
                    closeTerminal={closeTerminal}
                    zIndex={terminalIndex}
                    handleTerminalClick={handleTerminalClick}
                />
            )}
            <TerminalIcon toggleTerminal={toggleTerminal} />
            <NotepadIcon toggleNotepad={toggleNotepad} />
        </main>
    );
}
