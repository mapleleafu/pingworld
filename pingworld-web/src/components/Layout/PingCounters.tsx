import { useState, useEffect } from "react";
import Counter from "@blocks/Components/Counter/Counter";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/UI/tooltip";

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
  const dynamicPlaces = Array.from(
    { length: Math.max(1, Math.ceil(Math.log10(globalPingCount + 1)) + 2) },
    (_, i) => Math.pow(10, i),
  ).reverse();

  useEffect(() => {
    globalSetCount = setCount;
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              userSelect: "none",
            }}
          >
            <Counter
              value={globalPingCount}
              places={dynamicPlaces}
              fontSize={40}
              gap={10}
              containerStyle={{
                position: "relative",
                opacity: globalPingCount === 0 ? 0 : 1,
              }}
              textColor="black"
              fontWeight={900}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>Global Ping Count</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
