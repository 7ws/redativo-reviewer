type Theme = {
  id: string;
  title: string;
  description: string;
  short_description: string;
  background_image: string | null;
  essays_pending_review: string[] | null;
};

export default Theme;
