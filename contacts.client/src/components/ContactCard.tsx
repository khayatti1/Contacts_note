import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MWW from "./MaxWidthWrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, UserRoundPen, UserRoundX } from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Helmet } from "react-helmet";
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
import Tags from "./Tags";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  image: string;
  group: {
    id: number;
    name: string;
  };
  notes: {
    id: number;
    content: string;
  };
  tags: {
    name: string;
  }[];
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  address: z.string().min(1, "Address is required"),
  image: z.instanceof(FileList).optional(),
  note: z.string().optional(),
  groupId: z.string().min(1, "Group is required"), // Add GroupId as a required field
});

interface Group {
  id: number;
  name: string;
}

type ContactFormData = z.infer<typeof contactSchema>;

const ContactCard = () => {
  const { id } = useParams<{ id: string }>();
  const [error, setError] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const navigate = useNavigate();
  const [rerederer, setRerederer] = useState(0);

  useEffect(() => {
    const res = axios(`/api/contact/${id}`)
      .then((response) => {
        setContact(response.data);
        console.log(response);
      })
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div className="size-full">
        <Helmet>
          <title>Contact - Not found</title>
        </Helmet>
        <div className="text-lg size-full flex flex-col gap-3 items-center justify-center">
          <span className="flex flex-col items-center gap-2">
            <UserRoundX size={40} />
            <span className="text-xl font-semibold">Contact not found</span>
          </span>
          <Link
            to="/"
            className="text-base flex items-center gap-1 border border-primary/10 bg-primary ps-2 hover:bg-primary/90 text-background  duration-100 px-4 py-1 rounded-full"
          >
            <ArrowLeft size={20} />
            Back
          </Link>
        </div>
      </div>
    );
  }

  const deleteContact = async () => {
    try {
      await axios.delete(`/api/contact/${id}`);
      navigate("/");
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05, delayChildren: 0 },
    },
  };

  const item = {
    hidden: {
      opacity: 0,
      y: 60,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0,
      },
    },
  };

  return (
    <div className="size-full" key={rerederer}>
      {contact ? (
        <>
          <Helmet>
            <title>
              {contact.name
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </title>
          </Helmet>
          <div className="border-b mb-6">
            <MWW>
              <div className="py-3 justify-between items-center flex">
                <span className="text-lg font-semibold flex items-center gap-2">
                  <Link
                    to={`/`}
                    className="border border-primary/10 py-1.5 ps-3 px-5 rounded-full flex items-center gap-2 hover:bg-primary/10 duration-100"
                  >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                  </Link>
                </span>
                <div className="flex gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className=" rounded-[8px] flex items-center justify-center gap-2"
                        variant={"destructive"}
                      >
                        <UserRoundX />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Delete</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this contact?
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          className="rounded-[8px] flex items-center justify-center gap-2"
                          variant={"destructive"}
                          onClick={deleteContact}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <UpdateButtoon
                    contact={contact}
                    id={id}
                    setRerederer={setRerederer}
                    setContact={setContact}
                  />
                </div>
              </div>
            </MWW>
          </div>
          <MWW>
            <motion.div variants={container} initial="hidden" animate="show">
              {contact?.image && (
                <motion.div
                  variants={item}
                  className={
                    "text-5xl font-semibold aspect-[10/7] w-full p-6 my-2 flex items-end justify-start rounded-md overflow-hidden" +
                    (!contact?.image &&
                      " bg-secondary/10 border border-primary/5")
                  }
                  style={{
                    backgroundImage: `url(http://localhost:5276${contact?.image})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                ></motion.div>
              )}
              <motion.div
                variants={item}
                className="flex flex-col gap-2.5 mt-6"
              >
                {contact?.image ? (
                  <div className="flex flex-col p-6 py-3 rounded-md">
                    <span className="text-5xl font-semibold">
                      {contact
                        ? contact.name
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")
                        : "Loading..."}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="py-28 px-3">
                      <h2 className="text-5xl font-bold">
                        {contact?.name || "Loading..."}
                      </h2>
                    </div>
                  </>
                )}
              </motion.div>
              <motion.div
                variants={item}
                className="flex flex-wrap px-6 mt-4 gap-2"
              >
                {id && <Tags id={id} tags={contact?.tags} />}
              </motion.div>
              <div className="flex flex-col gap-2.5 mt-6">
                <motion.div
                  variants={item}
                  className="flex flex-col bg-secondary/10 border border-primary/5 p-6 py-3 rounded-md"
                >
                  <span className="text-base opacity-60">Phone</span>
                  <span className="text-xl">
                    {contact ? contact.phone : "Loading..."}
                  </span>
                </motion.div>
                <motion.div
                  variants={item}
                  className="flex flex-col bg-secondary/10 border border-primary/5 p-6 py-3 rounded-md"
                >
                  <span className="text-base opacity-60">E-mail</span>
                  <span className="text-xl">
                    {contact ? contact.email : "Loading..."}
                  </span>
                </motion.div>
                <motion.div
                  variants={item}
                  className="flex flex-col bg-secondary/10 border border-primary/5 p-6 py-3 rounded-md"
                >
                  <span className="text-base opacity-60">Adress</span>
                  <span className="text-xl">
                    {contact ? contact.address : "Loading..."}
                  </span>
                </motion.div>
                <motion.div
                  variants={item}
                  className="flex flex-col bg-secondary/10 border border-primary/5 p-6 py-3 rounded-md"
                >
                  <span className="text-base opacity-60">Group</span>
                  <span className="text-xl">
                    {contact ? contact.group.name : "Loading..."}
                  </span>
                </motion.div>
                <motion.div
                  variants={item}
                  className="flex flex-col bg-secondary/10 border border-primary/5 p-6 py-3 rounded-md min-h-60"
                >
                  <span className="text-base opacity-60">Note</span>
                  <span className="text-xl">
                    {" "}
                    {contact
                      ? contact.notes && contact.notes.content
                      : "Loading..."}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </MWW>
        </>
      ) : (
        <div className="h-screen flex flex-col">
          <div className="border-b mb-6">
            <MWW>
              <div className="py-3 justify-between items-center flex">
                <span className=" font-semibold flex items-center gap-2">
                  <Link
                    to={`/`}
                    className="border border-primary/10 py-2 ps-2 px-4 rounded-full flex items-center gap-2 hover:bg-primary/10 duration-100"
                  >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                  </Link>
                </span>
              </div>
            </MWW>
          </div>
          <div className="flex flex-1 justify-center items-center">
            <div className="size-8 border-t-2 border-primary rounded-full animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactCard;

function UpdateButtoon({
  contact,
  setRerederer,
  id,
  setContact,
}: {
  contact: Contact;
  id: string | undefined;
  setRerederer: React.Dispatch<React.SetStateAction<number>>;
  setContact: React.Dispatch<React.SetStateAction<Contact | null>>;
}) {
  if (!contact || !id) {
    return <></>;
  }

  // update
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact?.name || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      note: contact?.notes?.content || "",
      address: contact?.address || "",
      groupId: contact?.group?.id.toString() || "1",
      image: undefined,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      data.note && formData.append("note", data.note);
      formData.append("address", data.address);
      formData.append("groupId", data.groupId); // Append GroupId
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      const res = await axios.put(`/api/contact/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Contact updated successfully!", {
        position: "top-center",
      });
      form.reset();
      setContact(res.data);
      setRerederer((prev) => prev + 1);
    } catch (error: any) {
      toast.error("Failed to update contact. Please check your input.", {
        position: "top-center",
      });
      console.error(
        "Error adding contact:",
        error.response?.data || error.message
      );
    }
  };

  const [group, setgroups] = useState<Group[]>([]);

  useEffect(() => {
    fetch("/group")
      .then((response) => response.json())
      .then((data) => {
        setgroups(data);
      });
  }, []);

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

  const formContent = useMemo(() => {
    return (
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
                            {group.map((item) => (
                              <SelectItem key={item.id} value={item.id + ""}>
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
    );
  }, [form, group]);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className=" rounded-[8px] flex items-center gap-2">
            <UserRoundPen />
            Edit
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Contact</DialogTitle>
            <DialogDescription>
              Fill in the details below and save to update this contact.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    </>
  );
}
