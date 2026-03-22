import { Providers } from "./provider.tsx";
import { Router } from "./Router.tsx";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <Providers>
      <TooltipProvider>
        <Router />
      </TooltipProvider>
    </Providers>
  );
}

export default App;
