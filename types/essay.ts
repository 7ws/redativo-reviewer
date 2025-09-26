import Theme from "./theme";

type Essay = {
  id: string;
  title: string;
  status: string;
  status_text: string;
  theme: Theme;
};

export default Essay;
