import { LoaderCircle } from "lucide-react";

export const Loader = () => (
  <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
    <LoaderCircle className="h-8 w-8 animate-spin text-blue-400" />
  </div>
);
