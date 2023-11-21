import styles from "./icon.module.css";

export default function NotepadIcon({ toggleNotepad }) {
    const onIconClick = () => {
        toggleNotepad();
    };

    return (
        <main className={styles.icon_container}>
            <div className={styles.icon} onClick={onIconClick}>
                <div className={styles.pages}></div>
            </div>
            <text className={styles.icon_name}>Notepad</text>
        </main>
    );
}
