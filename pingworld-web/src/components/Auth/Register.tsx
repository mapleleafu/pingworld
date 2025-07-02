export default function Register() {
  return (
    <button onClick={handleRegister}>
      <h1 className="absolute z-10">Register</h1>
    </button>
  );
}

function handleRegister() {
  alert("Register button clicked");
}