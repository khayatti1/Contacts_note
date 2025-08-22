import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home.tsx";
import Login from "./pages/login.tsx";
import Register from "./pages/register.tsx";
import Contact from "./pages/contact.tsx";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider.tsx";

function App() {
  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="contact-theme">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            <Route path="/contact/:id" element={<Contact />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </>
  );
}
export default App;
