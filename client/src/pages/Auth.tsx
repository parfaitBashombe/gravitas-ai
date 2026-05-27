import { AuthView } from "@neondatabase/neon-js/auth/react";
import { useParams } from "react-router-dom";
import { HeroParticles } from "../components/ui/hero-particles";

const Auth = () => {
  const { pathname } = useParams();
  return (
    <div className="relative min-h-screen overflow-hidden pt-24 pb-12 px-6 flex items-center justify-center">
      <HeroParticles />
      <div
        className="relative z-10 max-w-md w-full backdrop-blur-xl rounded-2xl overflow-hidden border border-white/8"
        style={
          {
            "--card": "rgba(0,0,0,0.45)",
            "--neon-card": "rgba(0,0,0,0.45)",
            "--background": "transparent",
            "--neon-background": "transparent",
          } as React.CSSProperties
        }
      >
        <AuthView pathname={pathname} />
      </div>
    </div>
  );
};
export default Auth;
