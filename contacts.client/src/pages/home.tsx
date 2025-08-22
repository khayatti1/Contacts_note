import { Helmet } from "react-helmet";
import PrivateView from "../components/PrivateView";
import HomeNavbar from "@/components/HomePageNavbar";
import ContactTitle from "@/components/ContactTitle";
import ContactList from "@/components/ContactList";
import MWW from "@/components/MaxWidthWrapper";
import { useState } from "react";

const HomePage = () => {
  const [rerenderer, setRerenderer] = useState(0);

  return (
    <PrivateView>
      <>
        <Helmet>
          <title>Contact</title>
        </Helmet>
        <HomeNavbar setRerenderer={setRerenderer} />
        <MWW className="h-full">
          <ContactTitle title="Contacts" />
          <ContactList key={rerenderer} />
        </MWW>
      </>
    </PrivateView>
  );
};

export default HomePage;
