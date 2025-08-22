namespace contacts.Server.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public ICollection<Contact>? Contacts { get; set; }
        public required string CreatedBy { get; set; }
    }
}
