import { LoginForm } from "@/components/UI/auth/login-form";

interface AuthProps {
  onClose: () => void;
}

export default function Auth({ onClose }: AuthProps) {
  return <LoginForm onClose={onClose} />;
}