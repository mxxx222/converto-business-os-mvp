#!/usr/bin/env python3
"""Converto Agent CLI - Command-line interface for managing agents and workflows."""

import argparse
import asyncio
import json
import sys

# Add parent directory to path for imports
sys.path.insert(0, ".")

from shared_core.modules.agent_orchestrator.orchestrator import AgentOrchestrator
from shared_core.modules.agent_orchestrator.router import _register_default_agents


def setup_orchestrator() -> AgentOrchestrator:
    """Setup orchestrator with default agents."""
    orchestrator = AgentOrchestrator()
    _register_default_agents(orchestrator)
    return orchestrator


async def list_agents(args):
    """List all registered agents."""
    orchestrator = setup_orchestrator()
    agents = orchestrator.list_agents()

    print(f"\n📋 Registered Agents ({len(agents)}):\n")
    for agent in agents:
        print(f"  🤖 {agent.name} ({agent.agent_id})")
        print(f"     Type: {agent.agent_type.value}")
        print(f"     Version: {agent.version}")
        print(f"     Capabilities: {', '.join(agent.capabilities[:3])}...")
        print(f"     Reliability: {agent.reliability * 100:.1f}%")
        print()


async def list_workflows(args):
    """List all workflow templates."""
    orchestrator = setup_orchestrator()
    templates = orchestrator.list_workflow_templates()

    print(f"\n📋 Workflow Templates ({len(templates)}):\n")
    for template in templates:
        print(f"  🔄 {template.name} ({template.template_id})")
        print(f"     Description: {template.description}")
        print(f"     Steps: {len(template.steps)}")
        print(f"     Tags: {', '.join(template.tags)}")
        print()


async def run_workflow(args):
    """Run a workflow."""
    orchestrator = setup_orchestrator()

    # Parse initial variables from JSON if provided
    initial_variables = {}
    if args.variables:
        initial_variables = json.loads(args.variables)

    print(f"\n🚀 Executing workflow: {args.template_id}\n")

    execution = await orchestrator.execute_workflow(
        template_id=args.template_id,
        initial_variables=initial_variables,
        execution_name=args.name or f"CLI: {args.template_id}",
    )

    print("✅ Workflow execution started!")
    print(f"   Execution ID: {execution.execution_id}")
    print(f"   Status: {execution.status.value}")
    print(f"   Created: {execution.created_at}")
    print()

    # Poll for completion
    if args.wait:
        print("⏳ Waiting for completion...")
        max_wait = 60  # seconds
        start_time = asyncio.get_event_loop().time()

        while (asyncio.get_event_loop().time() - start_time) < max_wait:
            await asyncio.sleep(1)
            exec_status = orchestrator.get_workflow_status(execution.execution_id)

            if exec_status in ["completed", "failed"]:
                result = orchestrator.get_workflow_result(execution.execution_id)
                print(f"\n✅ Workflow {exec_status}!")
                if result:
                    print(f"   Result: {json.dumps(result, indent=2)}")
                break
        else:
            print("\n⏱️  Timeout waiting for completion")


async def get_status(args):
    """Get workflow execution status."""
    orchestrator = setup_orchestrator()

    execution = orchestrator.workflow_engine.get_execution(args.execution_id)

    if not execution:
        print(f"❌ Execution not found: {args.execution_id}")
        return

    print(f"\n📊 Execution Status: {args.execution_id}\n")
    print(f"   Status: {execution.status.value}")
    print(f"   Template: {execution.template_id}")
    print(f"   Name: {execution.name}")
    print(f"   Created: {execution.created_at}")

    if execution.started_at:
        print(f"   Started: {execution.started_at}")
    if execution.completed_at:
        print(f"   Completed: {execution.completed_at}")
    if execution.error:
        print(f"   Error: {execution.error}")

    print(f"\n   Steps ({len(execution.steps)}):")
    for step in execution.steps:
        status_icon = {
            "completed": "✅",
            "running": "🟡",
            "failed": "❌",
            "pending": "⏳",
        }.get(step.status.value, "❓")

        print(f"     {status_icon} {step.step_id} ({step.agent_id}) - {step.status.value}")
    print()


async def copilot_execute(args):
    """Execute workflow via Copilot (natural language)."""
    orchestrator = setup_orchestrator()

    from shared_core.modules.agent_orchestrator.copilot_integration import CopilotWorkflowExecutor

    executor = CopilotWorkflowExecutor(orchestrator)

    print(f"\n🤖 Copilot: {args.command}\n")

    result = await executor.execute_from_command(args.command)

    if result.get("success"):
        print(f"✅ {result.get('message', 'Workflow executed successfully')}")
        print(f"   Execution ID: {result.get('execution_id')}")
        print(f"   Status: {result.get('status')}")
    else:
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
        if result.get("suggestions"):
            print("\n💡 Suggestions:")
            for suggestion in result["suggestions"]:
                print(f"   - {suggestion}")
    print()


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description="Converto Agent CLI - Manage agents and workflows")

    subparsers = parser.add_subparsers(dest="command", help="Commands")

    # List agents
    list_agents_parser = subparsers.add_parser("agents", help="List all agents")
    list_agents_parser.set_defaults(func=list_agents)

    # List workflows
    list_workflows_parser = subparsers.add_parser("workflows", help="List workflow templates")
    list_workflows_parser.set_defaults(func=list_workflows)

    # Run workflow
    run_parser = subparsers.add_parser("run", help="Run a workflow")
    run_parser.add_argument("template_id", help="Workflow template ID")
    run_parser.add_argument("--name", help="Execution name")
    run_parser.add_argument("--variables", help="Initial variables (JSON)")
    run_parser.add_argument("--wait", action="store_true", help="Wait for completion")
    run_parser.set_defaults(func=run_workflow)

    # Get status
    status_parser = subparsers.add_parser("status", help="Get workflow execution status")
    status_parser.add_argument("execution_id", help="Execution ID")
    status_parser.set_defaults(func=get_status)

    # Copilot execute
    copilot_parser = subparsers.add_parser("copilot", help="Execute workflow via Copilot")
    copilot_parser.add_argument("command", help="Natural language command")
    copilot_parser.set_defaults(func=copilot_execute)

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    # Run async function
    asyncio.run(args.func(args))


if __name__ == "__main__":
    main()


