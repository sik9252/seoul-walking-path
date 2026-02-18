import { spawn } from "node:child_process";
import { loadEnvFile } from "../src/common/load-env";

type Step = {
  name: string;
  command: string;
  args: string[];
};

const steps: Step[] = [
  {
    name: "sync-seoul-courses",
    command: "npm",
    args: ["run", "sync:seoul-courses"],
  },
  {
    name: "geocode-checkpoints-kakao",
    command: "npm",
    args: ["run", "geocode:checkpoints:kakao"],
  },
  {
    name: "build-checkpoint-upsert-sql",
    command: "npm",
    args: ["run", "build:checkpoint-upsert-sql"],
  },
];

function runStep(step: Step): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(step.command, step.args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Step failed: ${step.name} (exit ${code ?? -1})`));
    });

    child.on("error", (error) => {
      reject(new Error(`Step failed: ${step.name} (${error.message})`));
    });
  });
}

async function sendFailureWebhook(message: string): Promise<void> {
  const webhookUrl = process.env.SYNC_FAILURE_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message,
      }),
    });
  } catch (error) {
    console.error("[daily-sync] failed to send webhook:", error);
  }
}

async function main() {
  loadEnvFile();
  const startedAt = new Date().toISOString();
  console.log(`[daily-sync] started: ${startedAt}`);

  try {
    for (const step of steps) {
      console.log(`[daily-sync] running ${step.name}`);
      await runStep(step);
    }

    const endedAt = new Date().toISOString();
    console.log(`[daily-sync] completed: ${endedAt}`);
  } catch (error) {
    const message = `[daily-sync] failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(message);
    await sendFailureWebhook(message);
    process.exit(1);
  }
}

void main();
