import Essay from "./essay";
import Thread from "./thread";

type Review = {
  id: string;
  essay: Essay;
  submitted_at: string;
  status: string;
  final_score: string;
  skill_1_score: string;
  skill_1_text: string;
  skill_2_score: string;
  skill_2_text: string;
  skill_3_score: string;
  skill_3_text: string;
  skill_4_score: string;
  skill_4_text: string;
  skill_5_score: string;
  skill_5_text: string;
  review_comment_threads: Thread;
};

export default Review;
