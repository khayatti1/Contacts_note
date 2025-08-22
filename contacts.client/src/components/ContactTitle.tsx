const ContactTitle = ({ title }: { title: string }) => {
  return (
    <div className="py-8 px-3">
      <h2 className="text-6xl font-bold">{title}</h2>
    </div>
  );
};

export default ContactTitle;
