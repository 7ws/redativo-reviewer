type UserProfile = {
  id: string;
  cpf: string | null;
  email: string | null;
  full_name: string;
  created_at: string;
  avatar_image: string | null;
  essay_count: string;
  is_reviewer: boolean;
  is_writer: boolean;
};

export default UserProfile;
