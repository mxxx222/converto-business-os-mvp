"""Agent Orchestrator - Main coordinator for multi-agent workflows."""

import logging
from typing import Any

from .agent_registry import AgentRegistry, AgentType
from .inter_agent_comm import InterAgentMessaging
from .workflow_engine import WorkflowEngine, WorkflowExecution, WorkflowStatus, WorkflowTemplate

logger = logging.getLogger("converto.agent_orchestrator")


class AgentOrchestrator:
    """Main orchestrator for managing multi-agent workflows."""

    def __init__(self):
        self.agent_registry = AgentRegistry()
        self.workflow_engine = WorkflowEngine(self.agent_registry)
        self.messaging = InterAgentMessaging()
        logger.info("Agent Orchestrator initialized")

    def register_agent(self, agent) -> None:
        """Register an agent in the orchestrator.

        Args:
            agent: Agent instance to register
        """
        self.agent_registry.register(agent)
        logger.info(f"Agent registered: {agent.get_metadata().agent_id}")

    def register_template(self, template: WorkflowTemplate) -> None:
        """Register a workflow template.

        Args:
            template: Workflow template to register
        """
        self.workflow_engine.register_template(template)

    async def execute_workflow(
        self, template_id: str, initial_variables: dict[str, Any], execution_name: str | None = None
    ) -> WorkflowExecution:
        """Execute a workflow.

        Args:
            template_id: Template identifier
            initial_variables: Initial workflow variables
            execution_name: Optional name for this execution

        Returns:
            Workflow execution instance
        """
        return await self.workflow_engine.execute_workflow(
            template_id=template_id,
            initial_variables=initial_variables,
            execution_name=execution_name,
        )

    def get_workflow_status(self, execution_id: str) -> WorkflowStatus | None:
        """Get workflow execution status.

        Args:
            execution_id: Execution identifier

        Returns:
            Workflow status or None if not found
        """
        execution = self.workflow_engine.get_execution(execution_id)
        return execution.status if execution else None

    def get_workflow_result(self, execution_id: str) -> dict[str, Any] | None:
        """Get workflow execution result.

        Args:
            execution_id: Execution identifier

        Returns:
            Workflow result (final variables) or None if not found/completed
        """
        execution = self.workflow_engine.get_execution(execution_id)

        if execution and execution.status == WorkflowStatus.COMPLETED:
            return execution.variables

        return None

    def list_agents(self, agent_type: AgentType | None = None) -> list:
        """List registered agents.

        Args:
            agent_type: Optional filter by agent type

        Returns:
            List of agent metadata
        """
        return self.agent_registry.list_agents(agent_type)

    def list_workflow_templates(self) -> list[WorkflowTemplate]:
        """List available workflow templates.

        Returns:
            List of workflow templates
        """
        return self.workflow_engine.list_templates()

    def list_workflow_executions(
        self, template_id: str | None = None, status: WorkflowStatus | None = None
    ) -> list[WorkflowExecution]:
        """List workflow executions.

        Args:
            template_id: Optional filter by template
            status: Optional filter by status

        Returns:
            List of workflow executions
        """
        return self.workflow_engine.list_executions(template_id, status)

    async def send_message(
        self,
        from_agent_id: str,
        to_agent_id: str | None,
        message_type: str,
        payload: dict[str, Any],
    ) -> str:
        """Send a message between agents.

        Args:
            from_agent_id: Sender agent ID
            to_agent_id: Recipient agent ID (None for broadcast)
            message_type: Type of message
            payload: Message payload

        Returns:
            Message ID
        """
        from .inter_agent_comm import MessageType

        msg_type = MessageType(message_type)

        return await self.messaging.send_message(
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            message_type=msg_type,
            payload=payload,
        )

    async def request_response(
        self,
        from_agent_id: str,
        to_agent_id: str,
        request_payload: dict[str, Any],
        timeout: float = 30.0,
    ) -> dict[str, Any] | None:
        """Send a request and wait for response.

        Args:
            from_agent_id: Sender agent ID
            to_agent_id: Recipient agent ID
            request_payload: Request payload
            timeout: Timeout in seconds

        Returns:
            Response payload or None if timeout
        """
        return await self.messaging.request_response(
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            request_payload=request_payload,
            timeout=timeout,
        )


