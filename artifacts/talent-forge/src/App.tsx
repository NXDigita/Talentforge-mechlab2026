import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import DesignVault from "@/pages/DesignVault";
import DesignVaultDetail from "@/pages/DesignVaultDetail";
import SimForge from "@/pages/SimForge";
import SimForgeRun from "@/pages/SimForgeRun";
import MechEdge from "@/pages/MechEdge";
import Challenges from "@/pages/Challenges";
import ChallengeWorkspace from "@/pages/ChallengeWorkspace";
import Portfolio from "@/pages/Portfolio";
import Leaderboard from "@/pages/Leaderboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/designvault/:id" component={DesignVaultDetail} />
      <Route path="/designvault" component={DesignVault} />
      <Route path="/simforge/:runId" component={SimForgeRun} />
      <Route path="/simforge" component={SimForge} />
      <Route path="/mechedge" component={MechEdge} />
      <Route path="/challenges/:id" component={ChallengeWorkspace} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/portfolio/:username" component={Portfolio} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
