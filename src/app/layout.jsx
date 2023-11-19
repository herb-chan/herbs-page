import styles from "./layout.module.css";

export const metadata = {
    title: "Herb's Page",
    description: "Made by herb.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={styles.html}>
            <body className={styles.page_content}>{children}</body>
        </html>
    );
}
