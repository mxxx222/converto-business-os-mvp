/** @fileoverview Pipedrive CRM integration with mock mode and graceful no-op */

export interface ActivityInput {
  subject: string;
  note?: string;
  person_id?: number;
  org_id?: number;
  due_date?: string;
}

export interface PipedriveResponse {
  success: boolean;
  data?: {
    id: number;
    mock?: boolean;
  };
  error?: string;
}

export async function createPipedriveActivity(input: ActivityInput): Promise<PipedriveResponse> {
  if (process.env.NO_EXTERNAL_SEND === "true") {
    return { success: true, data: { id: 0, mock: true } };
  }

  const token = process.env.PIPEDRIVE_API_TOKEN;
  if (!token) {
    // Graceful no-op if token is missing - don't fail the request
    return { success: false, error: "missing_token" };
  }

  const base = process.env.PIPEDRIVE_BASE_URL || "https://api.pipedrive.com/v1";
  const url = `${base}/activities?api_token=${token}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Pipedrive failed: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    // Log the error but don't fail the entire request - CRM is optional
    console.error("Pipedrive integration error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}
