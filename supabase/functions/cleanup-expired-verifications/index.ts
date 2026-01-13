import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Firebase Admin SDK initialization for Firestore
async function getFirebaseAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600;

  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: expiry,
    scope: "https://www.googleapis.com/auth/datastore"
  };

  const base64url = (obj: any) => {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    const base64 = btoa(str);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };

  const unsignedToken = `${base64url(header)}.${base64url(payload)}`;

  const privateKey = serviceAccount.private_key;
  const pemContents = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const jwt = `${unsignedToken}.${signatureBase64}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const tokenData = await tokenResponse.json();
  
  if (!tokenData.access_token) {
    console.error("Token exchange failed:", tokenData);
    throw new Error("Failed to get access token");
  }

  return tokenData.access_token;
}

async function getExpiredVerifications(accessToken: string, projectId: string): Promise<any[]> {
  const now = new Date().toISOString();
  
  // Query Firestore for expired verifications
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "verified_users" }],
          where: {
            compositeFilter: {
              op: "AND",
              filters: [
                {
                  fieldFilter: {
                    field: { fieldPath: "expiresAt" },
                    op: "LESS_THAN",
                    value: { stringValue: now }
                  }
                },
                {
                  fieldFilter: {
                    field: { fieldPath: "verified" },
                    op: "EQUAL",
                    value: { booleanValue: true }
                  }
                }
              ]
            }
          }
        }
      })
    }
  );

  const data = await response.json();
  console.log("Query response:", JSON.stringify(data, null, 2));
  
  // Filter results to only include documents with expired expiresAt
  const expired: any[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item.document) {
        const docPath = item.document.name;
        const docId = docPath.split('/').pop();
        expired.push({ id: docId, path: docPath });
      }
    }
  }
  
  return expired;
}

async function deleteOrUpdateVerification(accessToken: string, docPath: string): Promise<boolean> {
  try {
    // Update the document to set verified = false instead of deleting
    const response = await fetch(
      `https://firestore.googleapis.com/v1/${docPath}?updateMask.fieldPaths=verified&updateMask.fieldPaths=expiredAt`,
      {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            verified: { booleanValue: false },
            expiredAt: { stringValue: new Date().toISOString() }
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(`Failed to update ${docPath}:`, error);
      return false;
    }
    
    console.log(`Successfully expired verification: ${docPath}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${docPath}:`, error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    if (!serviceAccountJson) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT not configured");
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const projectId = serviceAccount.project_id;

    if (!projectId) {
      throw new Error("Invalid service account: missing project_id");
    }

    console.log("Starting cleanup of expired blue tick verifications...");
    console.log(`Project ID: ${projectId}`);

    // Get access token for Firestore
    const accessToken = await getFirebaseAccessToken(serviceAccount);
    console.log("Successfully obtained Firestore access token");

    // Get all expired verifications
    const expiredDocs = await getExpiredVerifications(accessToken, projectId);
    console.log(`Found ${expiredDocs.length} expired verifications`);

    if (expiredDocs.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No expired verifications found",
          cleaned: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update all expired verifications
    let successCount = 0;
    for (const doc of expiredDocs) {
      const success = await deleteOrUpdateVerification(accessToken, doc.path);
      if (success) successCount++;
    }

    console.log(`Cleanup complete: ${successCount}/${expiredDocs.length} verifications expired`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${successCount} expired verifications`,
        cleaned: successCount,
        total: expiredDocs.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in cleanup-expired-verifications:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
