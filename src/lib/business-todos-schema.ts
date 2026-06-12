import { z } from "zod";
import { TODO_CATEGORY_IDS } from "@/lib/business-todos";

const categoryEnum = z.enum(TODO_CATEGORY_IDS);

export const todoCategoryFieldsSchema = z
  .object({
    category: categoryEnum.optional(),
    categoryOther: z.string().max(120).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const category = data.category ?? "general";
    if (category === "other" && !data.categoryOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the other category",
        path: ["categoryOther"],
      });
    }
  });

export function todoCategoryData(body: {
  category?: string;
  categoryOther?: string | null;
}) {
  const category = body.category ?? "general";
  if (category !== "other") {
    return { category, categoryOther: null as string | null };
  }
  return {
    category: "other" as const,
    categoryOther: body.categoryOther?.trim() || null,
  };
}
