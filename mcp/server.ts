#!/usr/bin/env node
/**
 * PitOS MCP server (stdio transport).
 *
 * Run locally:
 *   npm run mcp
 *
 * Claude Desktop config (~/.config/Claude/claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "pitos": {
 *         "command": "npx",
 *         "args": ["tsx", "/absolute/path/to/pitos/mcp/server.ts"],
 *         "env": { "DATABASE_URL": "/absolute/path/to/pitos/pitos.db" }
 *       }
 *     }
 *   }
 *
 * Exposes ONLY parsed/structured team data — see mcp/tools.ts privacy boundary.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TOOLS } from "./tools";

const server = new McpServer({
  name: "pitos-mcp",
  version: "0.1.0",
});

// Shared zod shapes
const teamId = z.string().describe("Team ID (UUID).");

server.registerTool(
  "get_team_context",
  { description: TOOLS.get_team_context.description, inputSchema: { team_id: teamId } },
  async (args) => textResult(await TOOLS.get_team_context.handler(args))
);

server.registerTool(
  "list_facts",
  {
    description: TOOLS.list_facts.description,
    inputSchema: {
      team_id: teamId,
      fact_type: z
        .enum(["event", "metric", "decision", "relation", "milestone"])
        .optional(),
      evidence_quality: z.enum(["none", "weak", "strong"]).optional(),
      since: z.string().optional().describe("ISO-8601 date-time; only facts extracted after."),
      limit: z.number().int().positive().max(200).optional(),
    },
  },
  async (args) => textResult(await TOOLS.list_facts.handler(args))
);

server.registerTool(
  "list_decisions",
  {
    description: TOOLS.list_decisions.description,
    inputSchema: {
      team_id: teamId,
      since: z.string().optional(),
      limit: z.number().int().positive().max(200).optional(),
    },
  },
  async (args) => textResult(await TOOLS.list_decisions.handler(args))
);

server.registerTool(
  "list_tasks",
  {
    description: TOOLS.list_tasks.description,
    inputSchema: {
      team_id: teamId,
      status: z.enum(["open", "in_progress", "done", "blocked", "cancelled"]).optional(),
      limit: z.number().int().positive().max(200).optional(),
    },
  },
  async (args) => textResult(await TOOLS.list_tasks.handler(args))
);

server.registerTool(
  "list_entities",
  {
    description: TOOLS.list_entities.description,
    inputSchema: {
      team_id: teamId,
      kind: z.enum(["person", "organization", "event", "location"]).optional(),
      limit: z.number().int().positive().max(500).optional(),
    },
  },
  async (args) => textResult(await TOOLS.list_entities.handler(args))
);

server.registerTool(
  "list_generated_documents",
  {
    description: TOOLS.list_generated_documents.description,
    inputSchema: {
      team_id: teamId,
      doc_type: z
        .enum(["impact_narrative", "season_recap", "exit_pack", "judge_prep"])
        .optional(),
      limit: z.number().int().positive().max(100).optional(),
    },
  },
  async (args) => textResult(await TOOLS.list_generated_documents.handler(args))
);

server.registerTool(
  "get_document",
  {
    description: TOOLS.get_document.description,
    inputSchema: { team_id: teamId, doc_id: z.string() },
  },
  async (args) => textResult(await TOOLS.get_document.handler(args))
);

server.registerTool(
  "list_judge_sessions",
  {
    description: TOOLS.list_judge_sessions.description,
    inputSchema: {
      team_id: teamId,
      award_type: z
        .enum([
          "impact",
          "innovation",
          "engineering_inspiration",
          "rookie_all_star",
          "quality",
          "industrial_design",
          "safety",
          "judges",
        ])
        .optional(),
    },
  },
  async (args) => textResult(await TOOLS.list_judge_sessions.handler(args))
);

server.registerTool(
  "list_exit_packs",
  {
    description: TOOLS.list_exit_packs.description,
    inputSchema: {
      team_id: teamId,
      status: z.enum(["collecting", "review", "finalized"]).optional(),
    },
  },
  async (args) => textResult(await TOOLS.list_exit_packs.handler(args))
);

function textResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio transport keeps process alive via stdin pipe
}

main().catch((err) => {
  process.stderr.write(`pitos-mcp fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
