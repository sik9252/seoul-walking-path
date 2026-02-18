import { MockStoreService } from "../src/common/mock-store.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function now() {
  return new Date().toISOString();
}

function run() {
  const store = new MockStoreService();

  const attempt = store.createAttempt("qa-user", "c1");
  const checkpoints = store.getRouteCheckpoints("c1");
  assert(checkpoints.length > 0, "checkpoints should exist");

  for (const checkpoint of checkpoints) {
    const result = store.submitAttemptLocation(attempt.attemptId, checkpoint.lat, checkpoint.lng, now());
    assert(
      result.progress.visitedCheckpointIds.includes(checkpoint.id),
      `checkpoint should be visited: ${checkpoint.id}`,
    );
  }

  const completed = store.getAttemptProgress(attempt.attemptId);
  assert(completed.status === "completed", "attempt should be completed after all checkpoints");

  const secondAttempt = store.createAttempt("qa-user", "c1");
  const first = checkpoints[0];
  store.submitAttemptLocation(secondAttempt.attemptId, first.lat, first.lng, now());
  const abandoned = store.completeAttempt(secondAttempt.attemptId);
  assert(abandoned.status === "abandoned", "incomplete attempt should be abandoned on complete call");

  console.log("checkpoint flow verification passed");
}

run();
