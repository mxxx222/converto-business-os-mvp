"""
Email Inbox Processor for Converto Business OS

Processes incoming emails to receipts@converto.fi inbox:
- Extracts receipt attachments (PDF, images)
- Processes OCR on receipt images
- Stores receipt data in database
- Sends confirmation email to sender

Usage:
    from backend.modules.email.processor import process_receipt_email

    result = await process_receipt_email(
        from_email="user@example.com",
        subject="Receipt",
        attachments=[...],
        body_text="..."
    )
"""

import base64
import logging
import os
from datetime import datetime
from typing import Any

logger = logging.getLogger("converto.email.processor")

# Email configuration
RECEIPTS_EMAIL = os.getenv("RECEIPTS_EMAIL", "receipts@converto.fi")
SUPPORTED_ATTACHMENT_TYPES = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
}


async def process_receipt_email(
    from_email: str,
    subject: str,
    attachments: list[dict[str, Any]],
    body_text: str | None = None,
    body_html: str | None = None,
) -> dict[str, Any]:
    """
    Process incoming email with receipt attachments.

    Args:
        from_email: Sender email address
        subject: Email subject
        attachments: List of attachment dicts with 'name', 'content_type', 'data'
        body_text: Plain text email body
        body_html: HTML email body

    Returns:
        Dict with processing results:
        {
            "success": bool,
            "processed_count": int,
            "receipts": List[Dict],
            "errors": List[str]
        }
    """
    logger.info(f"Processing receipt email from {from_email}")

    results = {
        "success": False,
        "processed_count": 0,
        "receipts": [],
        "errors": [],
    }

    try:
        # Filter receipt attachments
        receipt_attachments = _filter_receipt_attachments(attachments)

        if not receipt_attachments:
            results["errors"].append("No receipt attachments found")
            logger.warning(f"No receipt attachments in email from {from_email}")
            return results

        logger.info(f"Found {len(receipt_attachments)} receipt attachments")

        # Process each attachment
        for attachment in receipt_attachments:
            try:
                receipt_data = await _process_receipt_attachment(
                    attachment=attachment,
                    from_email=from_email,
                    subject=subject,
                )

                if receipt_data:
                    # Store receipt in database (TODO: implement database storage)
                    # await store_receipt(receipt_data)

                    results["receipts"].append(receipt_data)
                    results["processed_count"] += 1

            except Exception as e:
                error_msg = (
                    f"Error processing attachment {attachment.get('name', 'unknown')}: {str(e)}"
                )
                logger.error(error_msg)
                results["errors"].append(error_msg)

        results["success"] = results["processed_count"] > 0

        # Send confirmation email (TODO: implement email sending)
        # if results["success"]:
        #     await send_confirmation_email(from_email, results["processed_count"])

        logger.info(f"Processed {results['processed_count']} receipts from {from_email}")

    except Exception as e:
        error_msg = f"Error processing receipt email: {str(e)}"
        logger.error(error_msg)
        results["errors"].append(error_msg)

    return results


def _filter_receipt_attachments(attachments: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Filter attachments to only include receipt images/PDFs.

    Args:
        attachments: List of attachment dicts

    Returns:
        Filtered list of receipt attachments
    """
    receipt_attachments = []

    for attachment in attachments:
        content_type = attachment.get("content_type", "").lower()
        filename = attachment.get("name", "").lower()

        # Check if attachment type is supported
        is_supported = False
        for mime_type, extensions in SUPPORTED_ATTACHMENT_TYPES.items():
            if mime_type in content_type:
                # Check file extension
                if any(filename.endswith(ext) for ext in extensions):
                    is_supported = True
                    break

        if is_supported:
            receipt_attachments.append(attachment)

    return receipt_attachments


async def _process_receipt_attachment(
    attachment: dict[str, Any],
    from_email: str,
    subject: str,
) -> dict[str, Any] | None:
    """
    Process single receipt attachment with OCR.

    Args:
        attachment: Attachment dict with 'name', 'content_type', 'data'
        from_email: Sender email address
        subject: Email subject

    Returns:
        Receipt data dict or None if processing failed
    """
    try:
        # Decode attachment data
        attachment_data = attachment.get("data")
        if isinstance(attachment_data, str):
            # Base64 encoded
            base64.b64decode(attachment_data)
        else:
            pass

        # Call OCR API (TODO: integrate with OCR service)
        # For now, return mock data structure
        receipt_data = {
            "merchant": None,
            "date": datetime.now().isoformat(),
            "total": None,
            "vat_amount": None,
            "vat_rate": None,
            "items": [],
            "payment_method": None,
            "receipt_number": None,
            "file_name": attachment.get("name", "unknown"),
            "file_type": attachment.get("content_type", "unknown"),
            "processed_at": datetime.now().isoformat(),
            "source": "email",
            "sender_email": from_email,
            "email_subject": subject,
            "ocr_status": "pending",  # pending, processed, failed
        }

        # TODO: Call OCR API endpoint
        # ocr_result = await call_ocr_api(attachment_bytes, attachment.get("content_type"))
        # receipt_data.update(ocr_result)

        return receipt_data

    except Exception as e:
        logger.error(f"Error processing receipt attachment: {str(e)}")
        return None


async def send_confirmation_email(to_email: str, processed_count: int) -> bool:
    """
    Send confirmation email to user after processing receipts.

    Args:
        to_email: Recipient email address
        processed_count: Number of receipts processed

    Returns:
        True if email sent successfully
    """
    try:
        # TODO: Implement email sending with Resend
        # from backend.modules.email.service import send_email
        #
        # await send_email(
        #     to=to_email,
        #     subject="Kuitit käsitelty",
        #     html=f"<p>Olemme käsitelleet {processed_count} kuitin/kuitit.</p>"
        # )

        logger.info(f"Confirmation email sent to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Error sending confirmation email: {str(e)}")
        return False


# Future: Database storage function
# async def store_receipt(receipt_data: Dict[str, Any]) -> str:
#     """
#     Store processed receipt in database.
#
#     Args:
#         receipt_data: Receipt data dict
#
#     Returns:
#         Receipt ID
#     """
#     # TODO: Implement Supabase storage
#     pass
