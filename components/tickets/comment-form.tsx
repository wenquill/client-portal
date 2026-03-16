"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CommentActionState } from "@/lib/actions/tickets";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  action: (state: CommentActionState, formData: FormData) => Promise<CommentActionState>;
}

const initialState: CommentActionState = {};

export function CommentForm({ action }: CommentFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      toast.success("Comment added");
      router.refresh();
    }
  }, [router, state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border bg-card p-4">
      <div className="space-y-2">
        <Label htmlFor="body">Add comment</Label>
        <Textarea
          id="body"
          name="body"
          rows={4}
          placeholder="Share an update, next step, or client-visible note"
          required
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Posting..." : "Post comment"}
      </Button>
    </form>
  );
}