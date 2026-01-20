type Invitation = {
  id: string;
  email: string;
  accepted_at: string | null;
  accepted_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export default Invitation;
