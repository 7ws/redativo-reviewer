import Comment from "./comment";

type Thread = {
  id: string;
  start_text_selection_x: string;
  start_text_selection_y: string;
  text_selection_width: string;
  text_selection_height: string;
  comments: Comment[];
};

export default Thread;
