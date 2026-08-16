import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  completeExtraction,
  editComplaintWithAi,
  logComplaintWithAi,
  pushUserMessage,
} from "@/store/slices/aiSlice";
import type { AIMessage } from "@/types/ai";
import type { ComplaintFormData } from "@/types/complaint";

interface AIChatProps {
  messages: AIMessage[];
  pending: boolean;
  suggestions?: string[];
  onSend?: (question: string) => void;
}

export function AIChat({
  messages,
  pending,
  suggestions = [],
  onSend,
}: AIChatProps) {
  const dispatch = useAppDispatch();
  const form = useAppSelector((state) => state.complaint.form);
  const [question, setQuestion] = useState("");

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || pending) {
      return;
    }

    setQuestion("");

    if (onSend) {
      onSend(trimmed);
      return;
    }

    dispatch(pushUserMessage(trimmed));

    if (
      Object.values(form).some((value) => String(value).trim().length > 0)
    ) {
      void dispatch(
        editComplaintWithAi({
          prompt: trimmed,
          currentState: form,
        }),
      ).then((action) => {
        if (editComplaintWithAi.fulfilled.match(action)) {
          dispatch(
            completeExtraction({
              extractedData: action.payload.extractedData,
              riskAssessment: action.payload.riskAssessment,
              completeness: action.payload.completeness,
              duplicateMatch: action.payload.duplicateMatch,
              explanation: action.payload.explanation,
            }),
          );
        }
      });
    } else {
      void dispatch(
        logComplaintWithAi({
          prompt: trimmed,
          currentState: form,
        }),
      ).then((action) => {
        if (logComplaintWithAi.fulfilled.match(action)) {
          dispatch(
            completeExtraction({
              extractedData: action.payload.extractedData,
              riskAssessment: action.payload.riskAssessment,
              completeness: action.payload.completeness,
              duplicateMatch: action.payload.duplicateMatch,
              explanation: action.payload.explanation,
            }),
          );
        }
      });
    }
  };

  return (
    <section className="panel flex min-h-[560px] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Sparkles className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-[14px] font-semibold">AI Quality Copilot</h2>
          <p className="text-[11.5px] text-muted-foreground">
            Extract, assess and investigate complaint information.
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="size-3.5" aria-hidden="true" />
              </span>
            )}

            <div
              className={`max-w-[82%] rounded-lg px-3.5 py-3 text-[12.5px] leading-5 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {pending && (
          <div className="text-[12px] text-muted-foreground">
            AI is analyzing the complaint...
          </div>
        )}

        {messages.length === 1 && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="rounded-md border border-border px-2.5 py-1.5 text-left text-[11.5px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            send(question);
          }}
        >
          <Input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask the quality copilot..."
            disabled={pending}
          />
          <Button type="submit" size="icon" disabled={pending || !question.trim()}>
            <Send className="size-4" aria-hidden="true" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </section>
  );
}
