import Essay from "./essay";

type Theme = {
  id: string;
  title: string;
  description: string;
  short_description: string;
  available_since: string;
  available_until: string;
  background_image: string | null;
  is_active: boolean;
  remaining_time: number | null;
  essays: Essay[] | null;
  essays_pending_review: string[] | null;
};

export default Theme;
