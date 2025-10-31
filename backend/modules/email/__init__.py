"""Email automation module for Converto Business OS."""

from .service import EmailService
from .templates import EmailTemplates
from .workflows import (
    EmailWorkflow,
    PilotOnboardingWorkflow,
    DeploymentNotificationWorkflow,
    ErrorAlertWorkflow,
    start_pilot_onboarding,
    notify_deployment_success,
    notify_deployment_failure,
    send_error_alert,
    check_and_alert_errors,
)

__all__ = [
    "EmailService",
    "EmailTemplates",
    "EmailWorkflow",
    "PilotOnboardingWorkflow",
    "DeploymentNotificationWorkflow",
    "ErrorAlertWorkflow",
    "start_pilot_onboarding",
    "notify_deployment_success",
    "notify_deployment_failure",
    "send_error_alert",
    "check_and_alert_errors",
]
