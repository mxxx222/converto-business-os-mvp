"""Multi-Agent Coordination Enhancements - Advanced orchestration features."""

import asyncio
import logging
from enum import Enum
from typing import Any

from .agent_registry import AgentRegistry
from .workflow_engine import WorkflowStep

logger = logging.getLogger("converto.agent_orchestrator")


class AgentPriority(str, Enum):
    """Agent priority levels."""

    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    CRITICAL = "critical"


class RoutingCondition:
    """Condition for conditional routing."""

    def __init__(self, condition: str, target_agent_id: str):
        self.condition = condition  # e.g., "ocr_confidence < 0.9"
        self.target_agent_id = target_agent_id

    def evaluate(self, context: dict[str, Any]) -> bool:
        """Evaluate condition based on context.

        Args:
            context: Execution context

        Returns:
            True if condition matches
        """
        try:
            # Simple condition evaluation (in production, use a proper expression evaluator)
            # Format: "variable operator value"
            parts = self.condition.split()
            if len(parts) != 3:
                return False

            var_name, operator, value_str = parts

            # Get variable value from context
            var_value = context.get(var_name)
            if var_value is None:
                return False

            # Parse value
            try:
                value = float(value_str)
                var_value = float(var_value)
            except ValueError:
                value = value_str
                var_value = str(var_value)

            # Evaluate operator
            operators = {
                "<": lambda x, y: x < y,
                ">": lambda x, y: x > y,
                "<=": lambda x, y: x <= y,
                ">=": lambda x, y: x >= y,
                "==": lambda x, y: x == y,
                "!=": lambda x, y: x != y,
            }
            op_func = operators.get(operator)
            return op_func(var_value, value) if op_func else False

        except Exception as e:
            logger.warning(f"Condition evaluation failed: {e}")
            return False


class ConditionalRouter:
    """Routes workflow execution based on conditions."""

    def __init__(self, agent_registry: AgentRegistry):
        self.agent_registry = agent_registry

    def route_step(
        self, step: WorkflowStep, context: dict[str, Any], previous_results: dict[str, Any]
    ) -> tuple[str, str | None]:
        """Route a step based on conditions.

        Args:
            step: Workflow step
            context: Execution context
            previous_results: Results from previous steps

        Returns:
            Tuple of (agent_id, fallback_agent_id)
        """
        # Check if step has conditional routing
        if not step.condition:
            return step.agent_id, None

        # Evaluate condition
        routing_condition = RoutingCondition(step.condition, step.agent_id)

        # Merge context and previous results for evaluation
        eval_context = {**context, **previous_results}

        if routing_condition.evaluate(eval_context):
            # Condition met, use primary agent
            return step.agent_id, None
        else:
            # Condition not met, check for fallback
            agent_metadata = self.agent_registry.get_metadata(step.agent_id)
            if agent_metadata and agent_metadata.fallback_agent_id:
                logger.info(
                    f"Condition not met for {step.agent_id}, "
                    f"using fallback: {agent_metadata.fallback_agent_id}"
                )
                return agent_metadata.fallback_agent_id, None

            # No fallback, use primary agent anyway
            return step.agent_id, None


class ParallelExecutor:
    """Optimizes parallel execution of independent steps."""

    def __init__(self, agent_registry: AgentRegistry):
        self.agent_registry = agent_registry

    def optimize_execution_order(self, steps: list[WorkflowStep]) -> list[list[WorkflowStep]]:
        """Group steps into parallel execution batches.

        Args:
            steps: List of workflow steps

        Returns:
            List of step batches (each batch can run in parallel)
        """
        # Build dependency graph
        {step.step_id: step for step in steps}
        completed = set()
        batches = []

        while len(completed) < len(steps):
            # Find steps ready to execute (all dependencies completed)
            ready = []

            for step in steps:
                if step.step_id in completed:
                    continue

                # Check if all dependencies are completed
                if all(dep_id in completed for dep_id in step.dependencies):
                    ready.append(step)

            if not ready:
                # Circular dependency or error
                logger.warning("No ready steps found, potential circular dependency")
                break

            batches.append(ready)
            completed.update(step.step_id for step in ready)

        return batches

    def prioritize_agents(self, steps: list[WorkflowStep]) -> list[WorkflowStep]:
        """Prioritize steps based on agent priority.

        Args:
            steps: List of workflow steps

        Returns:
            Prioritized list of steps
        """

        def get_priority(step: WorkflowStep) -> int:
            agent_metadata = self.agent_registry.get_metadata(step.agent_id)
            if not agent_metadata:
                return 1  # Normal priority

            # Higher reliability = higher priority
            # Lower cost = higher priority
            reliability_score = agent_metadata.reliability * 100
            cost_score = 100 - (agent_metadata.cost_per_request * 1000)  # Invert cost

            return int(reliability_score + cost_score)

        return sorted(steps, key=get_priority, reverse=True)


class RetryStrategy:
    """Retry strategy for failed agent executions."""

    def __init__(self, max_retries: int = 3, backoff_factor: float = 2.0):
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

    async def execute_with_retry(
        self,
        agent_executor,
        input_data: dict[str, Any],
        context: dict[str, Any],
        step: WorkflowStep,
    ) -> dict[str, Any]:
        """Execute agent with retry logic.

        Args:
            agent_executor: Function to execute agent
            input_data: Agent input data
            context: Execution context
            step: Workflow step

        Returns:
            Agent execution result
        """
        agent_metadata = context.get("agent_metadata")
        max_retries = agent_metadata.max_retries if agent_metadata else self.max_retries

        last_error = None

        for attempt in range(max_retries + 1):
            try:
                result = await agent_executor(input_data, context)
                return result
            except Exception as e:
                last_error = e
                if attempt < max_retries:
                    wait_time = self.backoff_factor**attempt
                    logger.warning(
                        f"Agent {step.agent_id} failed (attempt {attempt + 1}/{max_retries + 1}), "
                        f"retrying in {wait_time}s..."
                    )
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"Agent {step.agent_id} failed after {max_retries + 1} attempts")

        raise last_error or Exception("Unknown error")
