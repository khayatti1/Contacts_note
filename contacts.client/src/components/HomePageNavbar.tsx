import MWW from "./MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormItem,
  FormField as FField,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import React from "react";
import { ModeToggle } from "./mode-toggle";
import { CircleUserRound, LogOut, UserRoundPlus } from "lucide-react";
import LogoutLink from "./Logout";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  address: z.string().min(1, "Address is required"),
  image: z.instanceof(FileList).optional(),
  note: z.string().optional(),
  groupId: z.string().min(1, "Group is required"),
});

interface Group {
  id: number;
  name: string;
}

type ContactFormData = z.infer<typeof contactSchema>;

const FormField = ({
  id,
  label,
  placeholder,
  type = "text",
  registerField,
  errorMessage,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  registerField: any;
  errorMessage?: string;
}) => (
  <div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        type={type}
        className="col-span-3"
        {...registerField}
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <div></div>
      {errorMessage && (
        <span className="text-red-500 text-sm block w-full truncate mt-1 col-span-3">
          {errorMessage}
        </span>
      )}
    </div>
  </div>
);

const ContactForm = React.memo(
  ({
    form,
    onSubmit,
    groups,
  }: {
    form: any;
    onSubmit: (data: ContactFormData) => Promise<void>;
    groups: Group[];
  }) => (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 py-4">
          <FormField
            id="name"
            label="Full Name"
            placeholder="Name"
            registerField={form.register("name")}
            errorMessage={form.formState.errors.name?.message}
          />
          <FormField
            id="phone"
            label="Phone"
            placeholder="0123456789"
            type="number"
            registerField={form.register("phone")}
            errorMessage={form.formState.errors.phone?.message}
          />
          <FormField
            id="email"
            label="Email"
            placeholder="example@domain.com"
            registerField={form.register("email")}
            errorMessage={form.formState.errors.email?.message}
          />
          <FormField
            id="address"
            label="Address"
            placeholder="City, LOT"
            registerField={form.register("address")}
            errorMessage={form.formState.errors.address?.message}
          />
          <div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Group</Label>
              <FField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.isArray(groups) &&
                            groups.map((item) => (
                              <SelectItem
                                key={item.id}
                                value={item.id.toString()}
                              >
                                {item.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div></div>
              {form.formState.errors.groupId?.message && (
                <span className="text-red-500 text-sm block w-full truncate mt-1 col-span-3">
                  {form.formState.errors.groupId?.message}
                </span>
              )}
            </div>
          </div>
          <FormField
            id="image"
            label="Image"
            placeholder="Upload image"
            type="file"
            registerField={form.register("image")}
            errorMessage={form.formState.errors.image?.message}
          />
          <hr />
          <div>
            <Textarea
              id="note"
              placeholder="Note"
              className="col-span-3"
              {...form.register("note")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save Contact</Button>
        </DialogFooter>
      </form>
    </FormProvider>
  )
);

const HomeNavbar = ({
  setRerenderer,
}: {
  setRerenderer: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    fetch("/group")
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        setGroups(data);
      });
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      data.note && formData.append("note", data.note);
      formData.append("address", data.address);
      formData.append("groupId", data.groupId);
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      await axios.post("/api/contact", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Contact added successfully!", {
        position: "top-center",
      });
      form.reset();
      setRerenderer((prev) => prev + 1);
    } catch (error: any) {
      toast.error("Failed to add contact. Please check your input.", {
        position: "top-center",
      });
      console.error(
        "Error adding contact:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="border-b">
      <MWW>
        <div className="p-3 justify-between items-center flex">
          <span className="text-lg font-semibold flex items-center gap-2">
            <CircleUserRound />
            <span className="text-lg font-semibold">Home</span>
          </span>
          <div className="flex items-center gap-1">
            <ModeToggle />
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="rounded-sm ps-3 flex items-center gap-2 border border-primary/10"
                  variant="secondary"
                >
                  <UserRoundPlus size={20} />
                  <span>Add Contact</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Contact</DialogTitle>
                  <DialogDescription>
                    Fill in the details below and save to create a new contact.
                  </DialogDescription>
                </DialogHeader>
                <ContactForm form={form} onSubmit={onSubmit} groups={groups} />
              </DialogContent>
            </Dialog>
            <LogoutLink>
              <Button>
                <LogOut />
                Log out
              </Button>
            </LogoutLink>
          </div>
        </div>
      </MWW>
    </div>
  );
};

export default HomeNavbar;
