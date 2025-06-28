import { motion } from "framer-motion";
import Confetti from 'react-confetti';

interface ConfettiEffectProps {
  pieces?: number;
  duration?: number;
  gravity?: number;
  wind?: number;
}

export const ConfettiEffect = ({ 
  pieces = 1000, 
  duration = 2000, 
  gravity = 0.5, 
  wind = 0
}: ConfettiEffectProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2 }}
      className="pointer-events-none fixed inset-0 z-40"
    >
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        numberOfPieces={pieces}
        recycle={false}
        gravity={gravity}
        wind={wind}
        tweenDuration={duration}
        className="absolute inset-0"
      />
    </motion.div>
  );
};