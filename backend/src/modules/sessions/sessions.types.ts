
export type QrSessionStatus = "pending" | "claimed" | "expired";

export interface CreateQrSessionResponse {
  success: true;
  sessionId: string;
  pollToken: string;
  qrSvg: string;
  expiresAt: Date;
}

export interface ClaimQrSessionBody {
  token: string;
}

export interface ClaimQrSessionResponse {
  success: true;
  sessionId: string;
  database: {
    status: "connected";
    pingMs: number;
  };
}
