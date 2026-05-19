import type { IncomingMessage, ServerResponse } from "node:http"

const readBody = async (request: IncomingMessage): Promise<string> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = []

    request.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    })

    request.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"))
    })

    request.on("error", reject)
  })

const sendJson = (
  response: ServerResponse,
  statusCode: number,
  payload: unknown
) => {
  response.statusCode = statusCode
  response.setHeader("Content-Type", "application/json")
  response.end(JSON.stringify(payload))
}

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  response.setHeader("Access-Control-Allow-Origin", "*")
  response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (request.method === "OPTIONS") {
    response.statusCode = 204
    response.end()
    return
  }

  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed" })
    return
  }

  const authorization = request.headers.authorization
  if (!authorization?.startsWith("Bearer ")) {
    sendJson(response, 401, { error: "Missing SendGrid authorization token" })
    return
  }

  try {
    const body = await readBody(request)
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: authorization,
        "Content-Type": "application/json",
      },
      body,
    })

    if (sendGridResponse.status === 202) {
      sendJson(response, 202, { success: true })
      return
    }

    const errorText = await sendGridResponse.text()
    sendJson(response, sendGridResponse.status, {
      error: "Failed to send email",
      details: errorText,
    })
  } catch (error) {
    console.error("Error in email API route:", error)
    sendJson(response, 500, { error: "Internal server error" })
  }
}
