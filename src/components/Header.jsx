import styles from "../styles/Header.module.css";

function Header() {
  return (
    <div className={styles.header}>
      <h3>About</h3>
      <h2 className={styles.pixelPlayer}>PixelPlayer</h2>
      <h3>Donate</h3>
    </div>
  );
}

export default Header;
