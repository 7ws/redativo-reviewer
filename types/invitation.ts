type InvitationType = "CODE" | "EMAIL";

type InvitationStatus =
  | "ACTIVE"
  | "ACCEPTED"
  | "EXPIRED"
  | "REVOKED"
  | "CANCELLED";

type Invitation = {
  id: string;
  type: InvitationType;
  status: InvitationStatus;
  code: string | null;
  email: string | null;
  available_since: string | null;
  available_until: string | null;
  accepted_at: string | null;
  accepted_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export default Invitation;
export type { InvitationType, InvitationStatus };
