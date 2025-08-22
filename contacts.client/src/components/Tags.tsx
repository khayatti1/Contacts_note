import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import axios from "axios";
import { z } from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

interface Tag {
  id?: string;
  name: string;
}

// Zod schema for tag validation
const tagSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(20, "Name is too long")
    .default("test"),
  id: z.string().optional(),
});

type TagFormData = z.infer<typeof tagSchema>;

const Tags = ({ id, tags }: { id: string; tags: Tag[] }) => {
  const [error, setError] = useState<string>("");
  const [tagText, setTagText] = useState("");
  const [tagsList, setTags] = useState<Tag[]>(tags); // State to hold the tags
  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
  });

  const onSubmit = async (data: TagFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);

      const res = await axios.post(`/api/contact/tag/${id}`, formData);

      toast.success("Tag added successfully!", {
        position: "top-center",
      });
      setTags([...tagsList, { id: res.data.id, name: res.data.name }]);
      form.reset();
    } catch (error: any) {
      toast.error("Failed to update contact. Please check your input.", {
        position: "top-center",
      });
      console.error("Error adding Tag:", error.response?.data || error.message);
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      await axios.delete(`/tags/${tagId}`);
      setTags((prev) => prev.filter((tag) => tag.id != tagId));
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };
  return (
    <>
      {/* Example existing tag */}
      {tagsList &&
        tagsList.length > 0 &&
        tagsList.map((tag, index) => (
          <div
            key={index}
            data-custom={tag.id}
            className="flex justify-start items-center gap-2 p-1 ps-4 bg-secondary rounded-full pointer-events-none"
          >
            {tag.name}
            <button
              className="pointer-events-auto aspect-square bg-background p-1 rounded-full"
              onClick={() => {
                if (!tag.id) return;
                deleteTag(tag.id);
              }}
            >
              <Minus size={20} />
            </button>
          </div>
        ))}

      {/* New tag input */}
      <div className="flex items-center space-x-2">
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-center space-x-2"
          >
            <Input
              type="text"
              placeholder="New tag"
              className="h-8 w-24"
              onKeyUp={(e) => {
                setTagText(e.currentTarget.value);
              }}
              {...form.register("name")}
            />
            <Button
              size="sm"
              type="submit"
              disabled={
                !tagText || tagsList.some((item) => item.name === tagText)
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </FormProvider>
      </div>

      {/* Display error if validation fails */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </>
  );
};

export default Tags;
