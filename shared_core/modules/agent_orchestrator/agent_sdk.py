"""Agent SDK - Developer-friendly API for creating agents."""

import logging
from typing import Any

from .agent_registry import Agent, AgentMetadata, AgentType

logger = logging.getLogger("converto.agent_sdk")


def register_agent(
    agent_id: str,
    agent_type: AgentType,
    name: str,
    description: str,
    version: str = "1.0.0",
    capabilities: list[str] | None = None,
    dependencies: list[str] | None = None,
    reliability: float = 1.0,
    region: str | None = None,
    tags: list[str] | None = None,
    fallback_agent_id: str | None = None,
    max_retries: int = 3,
    timeout_ms: int = 30000,
):
    """Decorator to register an agent easily.

    Usage:
        @register_agent(
            agent_id="my_agent",
            agent_type=AgentType.ANALYSIS,
            name="My Analysis Agent",
            description="Does amazing analysis"
        )
        async def my_agent_execute(input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
            # Agent logic here
            return {"result": "success"}

    Args:
        agent_id: Unique agent identifier
        agent_type: Agent type
        name: Agent name
        description: Agent description
        version: Agent version
        capabilities: List of capabilities
        dependencies: List of dependency agent IDs
        reliability: Success rate (0.0-1.0)
        region: Region (e.g., "FI", "EU")
        tags: List of tags
        fallback_agent_id: Fallback agent ID
        max_retries: Maximum retry attempts
        timeout_ms: Timeout in milliseconds
    """

    def decorator(func):
        class SDKAgent(Agent):
            """SDK-generated agent wrapper."""

            async def execute(
                self, input_data: dict[str, Any], context: dict[str, Any]
            ) -> dict[str, Any]:
                """Execute agent logic."""
                return await func(input_data, context)

            def get_metadata(self) -> AgentMetadata:
                """Get agent metadata."""
                return AgentMetadata(
                    agent_id=agent_id,
                    agent_type=agent_type,
                    name=name,
                    description=description,
                    version=version,
                    capabilities=capabilities or [],
                    input_schema={},  # Would be inferred from function signature
                    output_schema={},  # Would be inferred from return type
                    dependencies=dependencies or [],
                    reliability=reliability,
                    region=region,
                    tags=tags or [],
                    fallback_agent_id=fallback_agent_id,
                    max_retries=max_retries,
                    timeout_ms=timeout_ms,
                )

            async def validate_input(self, input_data: dict[str, Any]) -> bool:
                """Validate input (always True for SDK agents, validation in execute)."""
                return True

        # Store agent class for later registration
        SDKAgent._sdk_metadata = {
            "agent_id": agent_id,
            "agent_type": agent_type,
            "name": name,
            "description": description,
        }

        return SDKAgent

    return decorator


class AgentSDK:
    """Agent SDK - Helper class for creating agents."""

    @staticmethod
    def create_agent(
        agent_id: str,
        agent_type: AgentType,
        name: str,
        description: str,
        execute_func,
        validate_func: callable | None = None,
        **metadata_kwargs,
    ) -> Agent:
        """Create an agent from functions.

        Args:
            agent_id: Unique agent identifier
            agent_type: Agent type
            name: Agent name
            description: Agent description
            execute_func: Async function that executes agent logic
            validate_func: Optional function to validate input
            **metadata_kwargs: Additional metadata

        Returns:
            Agent instance
        """

        class SimpleAgent(Agent):
            async def execute(
                self, input_data: dict[str, Any], context: dict[str, Any]
            ) -> dict[str, Any]:
                return await execute_func(input_data, context)

            def get_metadata(self) -> AgentMetadata:
                return AgentMetadata(
                    agent_id=agent_id,
                    agent_type=agent_type,
                    name=name,
                    description=description,
                    version=metadata_kwargs.get("version", "1.0.0"),
                    capabilities=metadata_kwargs.get("capabilities", []),
                    input_schema=metadata_kwargs.get("input_schema", {}),
                    output_schema=metadata_kwargs.get("output_schema", {}),
                    dependencies=metadata_kwargs.get("dependencies", []),
                    reliability=metadata_kwargs.get("reliability", 1.0),
                    region=metadata_kwargs.get("region"),
                    tags=metadata_kwargs.get("tags", []),
                    fallback_agent_id=metadata_kwargs.get("fallback_agent_id"),
                    max_retries=metadata_kwargs.get("max_retries", 3),
                    timeout_ms=metadata_kwargs.get("timeout_ms", 30000),
                )

            async def validate_input(self, input_data: dict[str, Any]) -> bool:
                if validate_func:
                    return await validate_func(input_data)
                return True

        return SimpleAgent()

    @staticmethod
    def register_agent_instance(agent: Agent, orchestrator) -> None:
        """Register an agent instance with orchestrator.

        Args:
            agent: Agent instance
            orchestrator: Agent orchestrator instance
        """
        orchestrator.register_agent(agent)
        logger.info(f"SDK Agent registered: {agent.get_metadata().agent_id}")


# Example usage:
"""
from shared_core.modules.agent_orchestrator.agent_sdk import register_agent, AgentType
from shared_core.modules.agent_orchestrator.orchestrator import AgentOrchestrator

@register_agent(
    agent_id="example_agent",
    agent_type=AgentType.ANALYSIS,
    name="Example Agent",
    description="An example agent created with SDK",
    capabilities=["analysis", "processing"]
)
class ExampleAgent:
    async def execute(self, input_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        # Your agent logic here
        return {"result": "success"}

# Register with orchestrator
orchestrator = AgentOrchestrator()
agent_instance = ExampleAgent()
orchestrator.register_agent(agent_instance)
"""


