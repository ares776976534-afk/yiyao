import styles from './index.module.css';
import { imgIcon } from '../imgIcon';

const LiftData = ({ direction, text }: { direction: string; text: string }) => {
    const direction_icon = {
        UP: 14,
        DOWN: 19,
    };
    const directionClass = {
        UP: styles.liftDataTextUp,
        DOWN: styles.liftDataTextDown,
    };

    return direction && (
        <div className={styles.liftData}>
            <img src={imgIcon[direction_icon[direction]]} alt="direction_icon" />
            <span className={directionClass[direction]}>{text}</span>
        </div>
    );
};

export default LiftData;