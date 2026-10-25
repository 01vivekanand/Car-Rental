import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { errorText } from "../api";
import { useAuth } from "../auth";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3D5CF5] focus-visible:ring-offset-2";
const field = `w-full rounded-lg border border-[#D6DDEB] bg-white px-3 py-2.5 text-sm text-[#0F1B33] placeholder:text-[#8A96AB] focus:border-[#3D5CF5] ${focus}`;

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/");
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const tab = (value: "login" | "register", label: string) => (
    <button
      type="button"
      onClick={() => {
        setMode(value);
        setError("");
      }}
      className={`-mb-px flex-1 border-b-2 pb-3 text-sm font-medium ${focus} ${
        mode === value ? "border-[#0F1B33] text-[#0F1B33]" : "border-transparent text-[#6B7790] hover:text-[#0F1B33]"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#DCE6EF]">
      <img
        src="/hero.jpg"
        alt="A row of five cars in a bright showroom"
        className="absolute inset-0 h-full w-full object-cover object-bottom"
      />

      <div className="relative mx-auto flex min-h-screen max-w-sm flex-col items-center px-5 pt-8 pb-40">
        <span className="text-xl font-semibold tracking-[0.3em] text-[#0F1B33]">MARQUE</span>

        <h1 className="mt-10 mb-6 text-center text-4xl font-semibold tracking-tight text-[#0F1B33] sm:text-5xl">
          Find your car
        </h1>

        <div className="w-full rounded-2xl bg-white p-6 shadow-xl shadow-[#3A5796]/15">
          <div className="mb-5 flex border-b border-[#E6EAF3]">
            {tab("login", "Log in")}
            {tab("register", "Register")}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <input
              required
              type="email"
              placeholder="Email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
            <input
              required
              type="password"
              minLength={6}
              placeholder="Password (6+ characters)"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
            {error && <p className="rounded-lg bg-[#FDECEA] px-3 py-2 text-sm text-[#B42318]">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className={`w-full rounded-lg bg-[#3D5CF5] py-2.5 text-sm font-semibold text-white hover:bg-[#2F4AD6] disabled:opacity-60 ${focus}`}
            >
              {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}