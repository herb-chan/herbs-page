import styles from "./icon.module.css";

export default function TerminalIcon({ toggleTerminal }) {
    const onIconClick = () => {
        toggleTerminal();
    };

    return (
        <main className={styles.icon_container}>
            <div className={styles.icon} onClick={onIconClick}>
                <h1 className={styles.icon_text}>{">_"}</h1>
            </div>
            <text className={styles.icon_name}>Terminal</text>
        </main>
    );
}
