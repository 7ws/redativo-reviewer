type UserProfile = {
  id: string;
  cpf: string | null;
  email: string | null;
  phone_number: string | null;
  full_name: string;
  created_at: string;
  avatar_image: string | null;
  redirect_url: string;
  institution: {
    id: string;
    name: string;
  } | null;
};

export default UserProfile;
