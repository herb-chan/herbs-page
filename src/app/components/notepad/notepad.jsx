import React, { useState, useRef, useCallback } from "react";
import styles from "./notepad.module.css";

export default function Notepad({ closeNotepad, zIndex, handleNotepadClick }) {
    const [notes, setNotes] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const notepadRef = useRef(null);

    const handleInputChange = (e) => {
        setNotes(e.target.value);
    };

    const handleMouseMove = useCallback(
        (e) => {
            if (isDragging) {
                const notepadRect = notepadRef.current.getBoundingClientRect();
                const offsetX = e.clientX - dragStart.x;
                const offsetY = e.clientY - dragStart.y;

                const newPosX = offsetX < 0 ? 0 : offsetX;
                const newPosY = offsetY < 0 ? 0 : offsetY;

                setPosition({
                    x: Math.min(newPosX, window.innerWidth - notepadRect.width),
                    y: Math.min(
                        newPosY,
                        window.innerHeight - notepadRect.height
                    ),
                });
            }
        },
        [isDragging, dragStart]
    );

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseDown = (e) => {
        setIsDragging(true);
        const offsetX = e.clientX - position.x;
        const offsetY = e.clientY - position.y;
        setDragStart({ x: offsetX, y: offsetY });
        onNotepadClick();
    };

    // Navigation buttons functions
    const onCloseClick = () => {
        closeNotepad();
    };

    const onNotepadClick = () => {
        handleNotepadClick();
    };

    let notepadTitle = "Notepad.herb";

    return (
        <main
            className={styles.notepad_window}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? "grabbing" : "default",
                zIndex: zIndex,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            ref={notepadRef}>
            <div className={styles.navigation_bar}>
                <div className={styles.navigation_buttons}>
                    <div
                        className={`${styles.nav_button} ${styles.close_button}`}
                        onClick={onCloseClick}></div>
                    <div
                        className={`${styles.nav_button} ${styles.minimize_button}`}></div>
                    <div
                        className={`${styles.nav_button} ${styles.fullscreen_button}`}></div>
                </div>
                <text className={styles.opened_repository}>{notepadTitle}</text>
                <div
                    className={`${styles.nav_button} ${styles.info_button}`}></div>
            </div>
            <div className={styles.notepad_input_container}>
                <textarea
                    spellcheck="false"
                    className={styles.notepad_textarea}
                    value={notes}
                    onChange={handleInputChange}
                    placeholder="Start typing here..."
                />
            </div>
        </main>
    );
}
