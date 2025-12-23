import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import { SignedIn, SignedOut, RedirectToSignIn, SignIn } from "@clerk/clerk-react";

export default function App() {
  return (
    <ThemeProvider>
      <SignedOut>
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
          <SignIn />
        </div>
      </SignedOut>
      <SignedIn>
        <Home />
      </SignedIn>
    </ThemeProvider>
  );
}
