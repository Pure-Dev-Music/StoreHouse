import { useEffect, useRef } from "react";

export function useBarcodeScanner(onScan: (barcode: string) => void) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Skip if typing in standard input/textarea (unless it has data-barcode-capture)
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (isInput && !target.hasAttribute("data-barcode-capture")) {
        return;
      }

      const now = Date.now();
      
      // USB scanners type very fast. Typically < 30ms between keystrokes.
      // If the gap between keys is long, it's manual input, so we reset the buffer.
      if (bufferRef.current.length > 0 && now - lastKeyTimeRef.current > 100) {
        bufferRef.current = "";
      }

      if (e.key === "Enter") {
        if (bufferRef.current.length > 0) {
          e.preventDefault();
          onScan(bufferRef.current);
          bufferRef.current = "";
        }
      } else if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      lastKeyTimeRef.current = now;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan]);
}
