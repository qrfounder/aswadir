import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export default function AnimatedValue({ value, suffix = "", className = "" }) {
  const spring = useSpring(value, { stiffness: 120, damping: 18 });
  const display = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);
  const [text, setText] = useState(`${value}${suffix}`);
  const prev = useRef(value);

  useEffect(() => {
    spring.set(value);
    if (value !== prev.current) {
      prev.current = value;
    }
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on("change", (v) => setText(v));
    return () => unsub();
  }, [display]);

  return (
    <motion.span
      key={value}
      className={className}
      initial={{ scale: 1.12, filter: "brightness(1.3)" }}
      animate={{ scale: 1, filter: "brightness(1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      {text}
    </motion.span>
  );
}
