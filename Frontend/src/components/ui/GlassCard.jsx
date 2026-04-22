import { motion } from 'framer-motion';

function GlassCard({
  children,
  className = '',
  hover = true,
  hoverClassName = 'hover:border-orange-200/8 hover:shadow-glow',
  hoverMotion = { y: -2, scale: 1.002 },
}) {
  return (
    <motion.div
      whileHover={hover ? hoverMotion : undefined}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={`rounded-4xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg shadow-card transition duration-300 ${
        hover ? hoverClassName : ''
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;