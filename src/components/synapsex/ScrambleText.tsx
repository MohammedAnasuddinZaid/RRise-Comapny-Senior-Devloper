"use client";

import { useEffect, useRef, useState } from "react";

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><";

const randChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

/**
 * Entrance reveal animation — scrambles in left-to-right once triggered.
 */
export function ScrambleIn({
  text,
  delay = 0,
  triggered = false,
  className,
}: {
  text: string;
  delay?: number;
  triggered?: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(() =>
    text
      .split("")
      .map((ch) => (ch === " " ? " " : "\u00A0"))
      .join(""),
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (!triggered || startedRef.current) return;
    startedRef.current = true;

    const startTimer = setTimeout(() => {
      let cursor = 0;
      const interval = setInterval(() => {
        cursor += 0.5;
        const reveal = Math.floor(cursor);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === " ") {
            out += " ";
            continue;
          }
          if (i < reveal) out += ch;
          else if (i < reveal + 3) out += randChar();
          else out += "\u00A0";
        }
        setDisplay(out);
        if (reveal >= text.length) {
          clearInterval(interval);
          setDisplay(text);
        }
      }, 25);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [triggered, delay, text]);

  return <span className={className}>{display}</span>;
}

/**
 * Hover-driven scramble — scrambles all chars then reveals left-to-right.
 */
export function ScrambleText({
  text,
  isHovered,
  className,
}: {
  text: string;
  isHovered: boolean;
  className?: string;
}) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isHovered) {
      const resetTimer = setTimeout(() => setDisplay(text), 0);
      return () => clearTimeout(resetTimer);
    }

    let frame = 0;
    let cursor = 0;
    intervalRef.current = setInterval(() => {
      frame += 1;
      if (frame % 4 === 0) cursor += 1;
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") {
          out += " ";
          continue;
        }
        if (i < cursor) out += ch;
        else out += randChar();
      }
      setDisplay(out);
      if (cursor >= text.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplay(text);
      }
    }, 25);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, text]);

  return <span className={className}>{display}</span>;
}
