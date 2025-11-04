"""Inter-Agent Communication - Enables agents to communicate with each other."""

import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any
from uuid import uuid4

logger = logging.getLogger("converto.agent_orchestrator")


class MessageType(str, Enum):
    """Types of messages between agents."""

    REQUEST = "request"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    BROADCAST = "broadcast"


@dataclass
class AgentMessage:
    """Message between agents."""

    message_id: str
    from_agent_id: str
    to_agent_id: str | None  # None for broadcast
    message_type: MessageType
    payload: dict[str, Any]
    timestamp: datetime
    correlation_id: str | None = None  # Links request/response pairs
    metadata: dict[str, Any] = None


class InterAgentMessaging:
    """Manages inter-agent communication."""

    def __init__(self):
        self._message_queue: asyncio.Queue = asyncio.Queue()
        self._message_history: list[AgentMessage] = []
        self._subscribers: dict[str, list[str]] = {}  # agent_id -> list of subscriber agent_ids
        self._message_handlers: dict[str, callable] = {}  # agent_id -> handler function

    async def send_message(
        self,
        from_agent_id: str,
        to_agent_id: str | None,
        message_type: MessageType,
        payload: dict[str, Any],
        correlation_id: str | None = None,
    ) -> str:
        """Send a message between agents.

        Args:
            from_agent_id: Sender agent ID
            to_agent_id: Recipient agent ID (None for broadcast)
            message_type: Type of message
            payload: Message payload
            correlation_id: Optional correlation ID for request/response pairs

        Returns:
            Message ID
        """
        message = AgentMessage(
            message_id=str(uuid4()),
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            message_type=message_type,
            payload=payload,
            timestamp=datetime.utcnow(),
            correlation_id=correlation_id,
        )

        await self._message_queue.put(message)
        self._message_history.append(message)

        logger.debug(
            f"Message sent from {from_agent_id} to {to_agent_id}: "
            f"{message_type} ({message.message_id})"
        )

        return message.message_id

    async def receive_message(
        self, agent_id: str, timeout: float | None = None
    ) -> AgentMessage | None:
        """Receive a message for an agent.

        Args:
            agent_id: Agent ID to receive messages for
            timeout: Optional timeout in seconds

        Returns:
            Message or None if timeout
        """
        try:
            # Get messages from queue that are for this agent or broadcasts
            start_time = asyncio.get_event_loop().time()

            while True:
                if timeout and (asyncio.get_event_loop().time() - start_time) > timeout:
                    return None

                try:
                    message = await asyncio.wait_for(self._message_queue.get(), timeout=1.0)

                    # Check if message is for this agent
                    if (
                        message.to_agent_id == agent_id
                        or message.to_agent_id is None
                        or agent_id in self._subscribers.get(message.from_agent_id, [])
                    ):
                        return message
                    else:
                        # Put message back for other agents
                        await self._message_queue.put(message)

                except TimeoutError:
                    continue

        except Exception as e:
            logger.error(f"Error receiving message for {agent_id}: {e}")
            return None

    def subscribe(self, agent_id: str, publisher_agent_id: str) -> None:
        """Subscribe an agent to messages from another agent.

        Args:
            agent_id: Subscriber agent ID
            publisher_agent_id: Publisher agent ID
        """
        if publisher_agent_id not in self._subscribers:
            self._subscribers[publisher_agent_id] = []

        if agent_id not in self._subscribers[publisher_agent_id]:
            self._subscribers[publisher_agent_id].append(agent_id)
            logger.info(f"Agent {agent_id} subscribed to {publisher_agent_id}")

    def unsubscribe(self, agent_id: str, publisher_agent_id: str) -> None:
        """Unsubscribe an agent from messages from another agent.

        Args:
            agent_id: Subscriber agent ID
            publisher_agent_id: Publisher agent ID
        """
        if (
            publisher_agent_id in self._subscribers
            and agent_id in self._subscribers[publisher_agent_id]
        ):
            self._subscribers[publisher_agent_id].remove(agent_id)
            logger.info(f"Agent {agent_id} unsubscribed from {publisher_agent_id}")

    async def request_response(
        self,
        from_agent_id: str,
        to_agent_id: str,
        request_payload: dict[str, Any],
        timeout: float = 30.0,
    ) -> dict[str, Any] | None:
        """Send a request and wait for a response (request-response pattern).

        Args:
            from_agent_id: Sender agent ID
            to_agent_id: Recipient agent ID
            request_payload: Request payload
            timeout: Timeout in seconds

        Returns:
            Response payload or None if timeout
        """
        correlation_id = str(uuid4())

        # Send request
        await self.send_message(
            from_agent_id=from_agent_id,
            to_agent_id=to_agent_id,
            message_type=MessageType.REQUEST,
            payload=request_payload,
            correlation_id=correlation_id,
        )

        # Wait for response
        start_time = asyncio.get_event_loop().time()

        while (asyncio.get_event_loop().time() - start_time) < timeout:
            message = await self.receive_message(from_agent_id, timeout=1.0)

            if (
                message
                and message.message_type == MessageType.RESPONSE
                and message.correlation_id == correlation_id
            ):
                return message.payload

        logger.warning(
            f"Request from {from_agent_id} to {to_agent_id} timed out "
            f"(correlation_id: {correlation_id})"
        )
        return None

    def get_message_history(
        self, agent_id: str | None = None, limit: int = 100
    ) -> list[AgentMessage]:
        """Get message history, optionally filtered by agent.

        Args:
            agent_id: Optional filter by agent ID
            limit: Maximum number of messages to return

        Returns:
            List of messages
        """
        messages = self._message_history

        if agent_id:
            messages = [
                m for m in messages if m.from_agent_id == agent_id or m.to_agent_id == agent_id
            ]

        return messages[-limit:]
