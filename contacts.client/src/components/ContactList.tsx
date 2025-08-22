import ContactItem from "./ContactItem";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Tag {
  name: string;
}
interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string;
  tags: Tag[];
}

const ContactList = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("all");

  // 📌 Fetch Contacts with Axios
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true); // Start Loading
      try {
        const response = await axios.get("/api/contact");
        const response2 = await axios.get("/tags");
        setContacts(response.data);
        setTags(response2.data);
        setTags((prev) => {
          if (!Array.isArray(prev)) return [];
          return prev.filter(
            (value, index, self) =>
              index ===
              self.findIndex(
                (t) => t.name.toLowerCase() === value.name.toLowerCase()
              )
          );
        });

        setFilteredContacts(response.data);
      } catch (err: any) {
        toast.error("Failed to fetch contacts, please try again later", {
          position: "top-center",
        });
        console.error("Error fetching contacts:", err);
      } finally {
        setLoading(false); // End Loading
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    if (!Array.isArray(contacts)) return;

    const filtered = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  useEffect(() => {
    if (filter.toLowerCase() === "all") {
      setFilteredContacts(contacts);
      return;
    }
    const filtered = contacts.filter((contact) =>
      contact.tags.some(
        (tag) => tag.name.toLowerCase() === filter.toLowerCase()
      )
    );
    setFilteredContacts(filtered);
  }, [tags, filter, tags]);

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <div className="size-8 border-t-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // 📌 Render Contacts
  return contacts.length > 0 ? (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{ opacity: 1 }}
      className="flex flex-col"
    >
      <div className="flex flex-col gap-3 mb-3 px-3">
        <Input
          placeholder="Search"
          className="!text-lg h-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ButtonSelectHolder>
          <ButtonSelect title="All" current={filter} setFilter={setFilter} />
          {tags &&
            tags.length > 0 &&
            tags.map((tag, index) => (
              <ButtonSelect
                title={tag.name}
                current={filter}
                key={index}
                setFilter={setFilter}
              />
            ))}
        </ButtonSelectHolder>
      </div>
      <AnimatePresence>
        {Array.isArray(filteredContacts) &&
          filteredContacts.length > 0 &&
          filteredContacts.map((contact) => (
            <motion.div layout className="w-full" key={contact.id}>
              <ContactItem
                name={contact.name}
                phone={contact.phone}
                email={contact.email}
                id={contact.id}
                key={contact.id}
                image={contact.image}
              />
            </motion.div>
          ))}
      </AnimatePresence>
    </motion.div>
  ) : (
    <div className="w-full h-64 flex justify-center items-center text-gray-500">
      No contacts found.
    </div>
  );
};

export default ContactList;

const ButtonSelectHolder = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex gap-1">{children}</div>;
};

const ButtonSelect = ({
  title,
  current,
  setFilter,
}: {
  title: string;
  current: string;
  setFilter: (filter: string) => void;
}) => {
  return (
    <Button
      onClick={() => setFilter(title)}
      variant={
        current.toLowerCase() == title.toLowerCase() ? "default" : "secondary"
      }
      size="sm"
      className="rounded-full py-0 px-4"
    >
      {title}
    </Button>
  );
};
