import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ContactItem = ({
  name,
  phone,
  email,
  id,
  image,
}: {
  name: string;
  phone: string;
  email: string;
  id: number;
  image: string;
}) => {
  return (
    <>
      <Link
        to={`/contact/${id}`}
        className="flex items-center gap-0 select-none cursor-pointer hover:bg-secondary/50 rounded-md overflow-hidden"
      >
        <Avatar className="h-16 w-16 my-3 ms-3 me-1">
          <AvatarImage
            src={"http://localhost:5276/" + image}
            className="object-cover"
          />
          <AvatarFallback className="text-xl tracking-wider">
            {name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex h-full p-3  w-full justify-between items-center">
          <div className="flex flex-col">
            <span className="font-semibold text-xl">
              {name
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </span>
            <span className=" opacity-75">
              {phone} • {email}
            </span>
          </div>
          <ChevronRight />
        </div>
      </Link>
    </>
  );
};

export default ContactItem;
