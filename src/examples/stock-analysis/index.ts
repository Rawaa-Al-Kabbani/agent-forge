import { configuredApiKey } from "./provider";
import { forge, llmProvider } from "../../core/decorators";
import { configuredProvider } from "./provider";
import { ensureDockerContainers } from "./setup-docker";
import { AgentForge, readyForge } from "../../core/agent-forge";
import { AnalystAgent } from "./agents/analyst.agent";
import { ManagerAgent } from "./agents/manager.agent";
import { WriterAgent } from "./agents/writer.agent";
import { ResearchAgent } from "./agents/research.agent";
import { RateLimiter, Visualizer } from "../../utils/decorators";

@Visualizer()
@RateLimiter({
  rateLimitPerSecond: 1,
  rateLimitPerMinute: 40,
  verbose: true,
})
@llmProvider(configuredProvider, {apiKey: configuredApiKey})
@forge()
class StockAnalysisTeam {
  static forge: AgentForge;

  static async run() {
    await ensureDockerContainers();
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Pass agent classes to readyForge - it will handle instantiation
    const agentClasses = [AnalystAgent, WriterAgent, ManagerAgent, ResearchAgent];

    // Use readyForge utility for async initialization
    await readyForge(StockAnalysisTeam, agentClasses);

    const team = StockAnalysisTeam.forge.createTeam("Team manager", "Stock Analysis Team", "A team of agents to analyze stock prices");
    team.addAgent(StockAnalysisTeam.forge.getAgent("Financial analyst")!);
    team.addAgent(StockAnalysisTeam.forge.getAgent("Report writer")!);
    team.addAgent(StockAnalysisTeam.forge.getAgent("Financial researcher")!);

    const report = await team.run("Write a report on the stock price of Apple", { verbose: true });
    console.log(report);
    // process.exit(0);
  }
}

StockAnalysisTeam.run();