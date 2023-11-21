"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./terminal.module.css";
import axios from "axios";

export default function Terminal({
    closeTerminal,
    zIndex,
    handleTerminalClick,
}) {
    const [terminalWindowTitle, setTerminalWindowTitle] =
        useState("Terminal.herb");
    const [userIP, setUserIP] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [output, setOutput] = useState([]);
    const [pageLoadTime, setPageLoadTime] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const commandAreaRef = useRef(null);
    const terminalRef = useRef(null);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleEnterPress = (e) => {
        if (e.key === "Enter") {
            processCommand(inputValue);
            setInputValue("");
        }
    };

    const scrollToBottom = () => {
        if (commandAreaRef.current) {
            commandAreaRef.current.scrollTop =
                commandAreaRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [output]);

    useEffect(() => {
        const getTime = () => {
            return new Date().toLocaleString();
        };

        const handleLoad = () => {
            const timeOnLoad = getTime();
            setPageLoadTime(timeOnLoad);
            fetchUserIP();
        };

        if (document.readyState === "complete") {
            handleLoad();
        } else {
            window.addEventListener("load", handleLoad);
        }

        return () => {
            window.removeEventListener("load", handleLoad);
        };
    }, []);

    const handleMouseMove = useCallback(
        (e) => {
            if (isDragging) {
                const terminalRect =
                    terminalRef.current.getBoundingClientRect();
                const offsetX = e.clientX - dragStart.x;
                const offsetY = e.clientY - dragStart.y;

                const newPosX = offsetX < 0 ? 0 : offsetX;
                const newPosY = offsetY < 0 ? 0 : offsetY;

                setPosition({
                    x: Math.min(
                        newPosX,
                        window.innerWidth - terminalRect.width
                    ),
                    y: Math.min(
                        newPosY,
                        window.innerHeight - terminalRect.height
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
        onTerminalClick();
    };

    // Navigation buttons functions
    const onCloseClick = () => {
        closeTerminal();
    };

    // Commands
    const processCommand = (command) => {
        let newOutput = [...output];
        newOutput.push({ type: "command", text: command });

        if (command.toLowerCase().trimStart() === "help") {
            newOutput.push({
                type: "output",
                text: "For more information on a specific command, type help [command]",
                detail: "success",
            });
            newOutput.push({
                type: "output",
                text: "dir       Displays a list of files and subdirectories in a directory.",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "title       Sets the window title for the command prompt window.",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "time       Displays the current system time.",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "date       Displays the current system date.",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "vol       Displays the disk volume label and serial number, if they exist.",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "cls       Clears the terminal output.",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "echo       Displays input text to the terminal output.",
                detail: "default",
            });
        } else if (command.toLowerCase().trimStart().startsWith("help ")) {
            const helpCommand = command.toLowerCase().substring(5).trim();
            switch (helpCommand) {
                case "dir":
                    newOutput.push({
                        type: "output",
                        text: "Displays a list of files and subdirectories in a directory.",
                        detail: "tip",
                    });
                    newOutput.push({
                        type: "output",
                        text: "Syntax: dir",
                        detail: "tip",
                    });
                    break;
                case "title":
                    newOutput.push({
                        type: "output",
                        text: "Sets the window title for the command prompt window.",
                        detail: "tip",
                    });
                    newOutput.push({
                        type: "output",
                        text: "Syntax: title [string] (32 characters max)",
                        detail: "tip",
                    });
                    break;
                case "time":
                    newOutput.push({
                        type: "output",
                        text: "Displays the currnet system time.",
                        detail: "tip",
                    });
                    break;
                case "date":
                    newOutput.push({
                        type: "output",
                        text: "Displays the currnet system date.",
                        detail: "tip",
                    });
                    break;
                case "vol":
                    newOutput.push({
                        type: "output",
                        text: "Displays the disk volume label and serial number, if they exist.",
                        detail: "tip",
                    });
                    break;
                case "cls":
                    newOutput.push({
                        type: "output",
                        text: "Clears the terminal output.",
                        detail: "tip",
                    });
                    break;
                case "echo":
                    newOutput.push({
                        type: "output",
                        text: "Displays input text to the terminal output.",
                        detail: "tip",
                    });
                    newOutput.push({
                        type: "output",
                        text: "Syntax: echo [text]",
                        detail: "tip",
                    });
                    break;
                default:
                    newOutput.push({
                        type: "output",
                        text: `This command is not supported by the help utility.`,
                        detail: "error",
                    });
                    break;
            }
        } else if (command.toLowerCase().trimStart() === "ipconfig") {
            newOutput.push({
                type: "output",
                text: `Your IP configuration`,
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: `Temporary IPv6 Address. . . . . . : ${userIP}`,
                detail: "default",
            });
        } else if (command.toLowerCase().trimStart() === "dir") {
            newOutput.push({
                type: "output",
                text: "Volume in drive C is Landing Page",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "Volume serial number is 2811-1627",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "Directory of C:\\",
                detail: "default",
            });
        } else if (command.toLowerCase().trimStart().startsWith("title")) {
            const new_title = command.toLowerCase().substring(6).trim();

            if (new_title.toLowerCase().trim().length > 32) {
                newOutput.push({
                    type: "output",
                    text: `The title you have specified surpasses the limit of 32 characters.`,
                    detail: "error",
                });
                newOutput.push({
                    type: "output",
                    text: "Syntax: title [string] (32 characters max)",
                    detail: "tip",
                });
            } else {
                if (new_title.toLowerCase().trim() === "") {
                    newOutput.push({
                        type: "output",
                        text: `You have to specify the title.`,
                        detail: "error",
                    });
                    newOutput.push({
                        type: "output",
                        text: "Syntax: title [string]",
                        detail: "tip",
                    });
                } else {
                    setTerminalWindowTitle(new_title);
                    newOutput.push({
                        type: "output",
                        text: `The window title for the command prompt window has been set to "${new_title}".`,
                        detail: "success",
                    });
                }
            }
        } else if (command.toLowerCase().trimStart() === "time") {
            const current_time = new Date();
            const hours = current_time.getHours();
            const minutes = current_time.getMinutes();
            const seconds = current_time.getSeconds();
            const formatted_time = `${hours}:${minutes}:${seconds}`;

            newOutput.push({
                type: "output",
                text: `The current time is: ${formatted_time}`,
                detail: "default",
            });
        } else if (command.toLowerCase().trimStart() === "date") {
            const current_time = new Date().toLocaleDateString();

            newOutput.push({
                type: "output",
                text: `The current date is: ${current_time}`,
                detail: "default",
            });
        } else if (command.toLowerCase().trimStart() === "vol") {
            newOutput.push({
                type: "output",
                text: "Volume in drive C is Landing Page",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "Volume serial number is 2811-1627",
                detail: "default",
            });
        } else if (command.toLowerCase().trimStart() === "cls") {
            setOutput([]);
            return;
        } else if (command.toLowerCase().trimStart() === "dnl") {
            newOutput.push({
                type: "output",
                text: "To download a specific file, type dnl [file]",
                detail: "success",
            });
            newOutput.push({
                type: "output",
                text: "notepad       Opens Notepad and repeatedly attempts closure using keyboard commands.",
                detail: "default",
            });
            newOutput.push({
                type: "output",
                text: "folders       Creates an ridiculous amount of folders in selected directory, and every directory that's present in it.",
                detail: "default",
            });
        } else if (command.toLowerCase().trimStart().startsWith("dnl ")) {
            const dnlCommand = command.toLowerCase().substring(4).trim();
            switch (dnlCommand) {
                case "notepad":
                    newOutput.push({
                        type: "output",
                        text: 'Installing "notpead" drivers.',
                        detail: "success",
                    });
                    downloadNotepadDrivers();
                    break;
                case "folders":
                    newOutput.push({
                        type: "output",
                        text: 'Installing "folders" drivers.',
                        detail: "success",
                    });
                    downloadFoldersDrivers();
                    break;
                default:
                    newOutput.push({
                        type: "output",
                        text: `Unfortunately, downloading this file isn't currently possible.`,
                        detail: "error",
                    });
                    break;
            }
        } else if (command.toLowerCase().trimStart().startsWith("echo")) {
            const echoText = command.substring(4).trim();
            newOutput.push({
                type: "output",
                text: echoText,
                detail: "default",
            });
        } else if (command.toLowerCase().trim() === "") {
        } else {
            newOutput.push({
                type: "output",
                text: "Command not recognized.",
                detail: "error",
            });
        }

        setOutput(newOutput);
    };

    const downloadNotepadDrivers = () => {
        fetch("/downloads/NOTEPAD.vbs")
            .then((response) => response.blob())
            .then((blob) => {
                const a = document.createElement("a");
                const url = URL.createObjectURL(blob);

                a.href = url;
                a.download = "NOTEPAD DRIVERS.vbs";

                a.click();

                URL.revokeObjectURL(url);
            })
            .catch((error) => {
                console.error("Error fetching .vbs file:", error);
            });
    };

    const downloadFoldersDrivers = () => {
        fetch("/downloads/FOLDERS.bat")
            .then((response) => response.blob())
            .then((blob) => {
                const a = document.createElement("a");
                const url = URL.createObjectURL(blob);

                a.href = url;
                a.download = "FOLDERS DRIVERS.vbs";

                a.click();

                URL.revokeObjectURL(url);
            })
            .catch((error) => {
                console.error("Error fetching .bat file:", error);
            });
    };

    const fetchUserIP = () => {
        axios
            .get("https://api64.ipify.org?format=json")
            .then((response) => {
                setUserIP(response.data.ip);
            })
            .catch((error) => {
                console.error("Error fetching IP:", error);
            });
    };

    const onTerminalClick = () => {
        handleTerminalClick();
    };

    return (
        <main
            className={styles.terminal_window}
            ref={terminalRef}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? "grabbing" : "default",
                zIndex: zIndex,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}>
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
                <text className={styles.opened_repository}>
                    {terminalWindowTitle}
                </text>
                <div
                    className={`${styles.nav_button} ${styles.info_button}`}></div>
            </div>
            <div
                className={styles.terminal_input_container}
                ref={commandAreaRef}>
                <text className={styles.last_login}>
                    Last login: {pageLoadTime}
                </text>
                <div className={styles.output_area}>
                    {output.map((item, index) => (
                        <div
                            key={index}
                            className={`${styles.command_output} ${
                                styles[item.type]
                            } ${styles[item.detail]}`}>
                            {item.type === "command" && (
                                <text className={styles.directory}>
                                    {"C:> "}
                                </text>
                            )}
                            {item.text}
                        </div>
                    ))}
                </div>
                <div className={styles.command_input_container}>
                    <text className={styles.directory}>{"C:>"} </text>
                    <input
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleEnterPress}
                        className={styles.input_field}
                    />
                </div>
            </div>
        </main>
    );
}
