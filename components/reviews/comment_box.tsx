import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CommentBoxProps {
  position: { x: number; y: number };
  comment: string;
  competencies: number[];
  onCommentChange: (value: string) => void;
  onCompetencyToggle: (num: number) => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function CommentBox({
  position,
  comment,
  competencies,
  onCommentChange,
  onCompetencyToggle,
  onSave,
  onDelete,
}: CommentBoxProps) {
  return (
    <div
      className="comment-box absolute bg-white rounded-xl shadow-lg border-2 border-blue-600 p-4 z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translateX(-50%)",
        width: "350px",
        maxWidth: "90vw",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onCompetencyToggle(num)}
              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-sm font-semibold transition-colors ${
                competencies.includes(num)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <Textarea
        placeholder="Adicione um comentário"
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        className="border-gray-300 placeholder:text-gray-400 min-h-[100px] resize-none"
        autoFocus
      />

      <Button
        onClick={onSave}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
      >
        Salvar
      </Button>
    </div>
  );
}
