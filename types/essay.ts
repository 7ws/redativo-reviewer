import Theme from "./theme";

type Essay = {
  id: string;
  title: string;
  theme: Theme;
  status: string;
  status_text: string;
  text_image: string | null;
  reviews: number;
};

export default Essay;
