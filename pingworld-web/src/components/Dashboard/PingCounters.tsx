import { useState, useEffect } from "react";
import Counter from "@blocks/Counter/Counter";

let globalSetCount: (value: number) => void;
let globalCountRef = { current: 0 };

export const incrementGlobalPing = () => {
  globalCountRef.current += 1;
  globalSetCount?.(globalCountRef.current);
};

export const setGlobalPingCount = (value: number) => {
  globalCountRef.current = value;
  globalSetCount?.(value);
};

export default function PingCounters() {
  const [globalPingCount, setCount] = useState(0);

  useEffect(() => {
    globalSetCount = setCount;
  }, []);

  return (
    <Counter
      value={globalPingCount}
      places={[100000, 10000, 1000, 100, 10, 1]}
      fontSize={40}
      gap={10}
      containerStyle={{
        position: "absolute",
        top: 10,
        right: 10,
      }}
      textColor="black"
      fontWeight={900}
    />
  );
}
